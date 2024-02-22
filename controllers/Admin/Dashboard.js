const { ObjectId } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const moment = require("moment");
const { ConsoleMessage } = require("puppeteer");
 
module.exports = {
  DataDashboard: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const asset_coll = db.collection("asset_kendaraan");
      const sesi_coll = db.collection("sesi_request_pinjam");
      const pinjaman_count = await sesi_coll.countDocuments({
        status_sesi: { $in: ["perjalanan", "selesai", "persiapan"] },
      });
      const status_digunakan = await sesi_coll.countDocuments({
        status_sesi: { $in: ["perjalanan"] },
      });
      const status_tidak_terpakai = await asset_coll.aggregate([
        {
          $lookup: {
            from: "sesi_request_pinjam",
            localField: "_id",
            foreignField: "_assetID",
            as: "sesi_data",
          },
        },
        {
          $match: { "sesi_data.status_sesi": { $nin: ["perjalanan"] } },
        },
        {
          $group: {
            _id: null, // Anda bisa mengganti null dengan nilai yang sesuai jika ingin mengelompokkan berdasarkan kriteria tertentu
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
          },
        },
      ]).toArray();
      const status_rusak = await sesi_coll.countDocuments({
        $or: [
          { "sesi_kondisi_pergi.kondisi": "tidak" },
          { "sesi_kondisi_kembali.kondisi": "tidak" },
        ],
      });
      const visualChart = await sesi_coll
        .aggregate([
          {
            $group: {
              _id: "$action_date",
              count: { $sum: 1 },
            },
          },
          {
            $match: {
              _id: {
                $lte: moment().format("YYYY-MM-DD"),
                $gte: moment()
                  .subtract(parseFloat(req.params._YYYY), "year")
                  .subtract(parseFloat(req.params._MM), "month")
                  .set("date", 1)
                  .format("YYYY-MM-DD"),
              },
            },
          },
          {
            $project: {
              _id: 0,
              action_date: "$_id",
              count: 1,
            },
          },
        ])
        .toArray();
      const PrintData = await sesi_coll
        .aggregate([
          {
            $lookup: {
              from: "asset_kendaraan",
              localField: "_assetID",
              foreignField: "_id",
              as: "asset",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "_pengemudiID",
              foreignField: "_id",
              as: "pengemudi",
            },
          },
          {
            $lookup: {
              from: "request_pinjam",
              localField: "_requestID",
              foreignField: "_id",
              as: "permintaan",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "permintaan._userID",
              foreignField: "_id",
              as: "peminjam",
            },
          },
          {
            $match: {
              status_sesi:"selesai",
              "action_date": {
                $lte: moment().format("YYYY-MM-DD"),
                $gte: moment()
                  .subtract(parseFloat(req.params._YYYY), "year")
                  .subtract(parseFloat(req.params._MM), "month")
                  .set("date", 1)
                  .format("YYYY-MM-DD"),
              },
            },
          },
          {
            $project: {
              _id: 0,
              "bbm": 1,
          
   
              "jam_kembali": 1,
              "waktu_tanggal_kembali": 1,
              asset: {
                "nama_kendaraan": 1,
                "plat_nomor": 1,
              },
                    peminjam:{username:1},
            pengemudi:{username:1},
            permintaan:{ "keperluan": 1,
            "waktu_jam": 1,
 
    
            "waktu_tanggal": 1,}
            },
      
            // permintaan:1

          },
        ])
        .toArray();
      const asset_count = await asset_coll.countDocuments();
      return res.status(200).send(
        ApiResponse("Berhasil mendapatkan data", true, 200, [
          {
            totalitas: {
              pinjaman: pinjaman_count,
              asset: asset_count,
              perawatan: 0,
            },
            status_kendaraan: {
              status_digunakan: status_digunakan,
              status_tidak_terpakai: status_tidak_terpakai[0].count,
              status_rusak: status_rusak,
            },
            DataChart: visualChart,
            DataPrint: PrintData
          },
        ])
      );
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DataVisualPie: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("visual_pie");
      const coll_sesi = db.collection("sesi_request_pinjam");
      const coll_kendaraan = db.collection("asset_kendaraan");
      const coll_Kendaraan = await coll_kendaraan.find().toArray();
      const coll_main = await collection.find().toArray();
      const coll_Sesi = await coll_sesi.find().toArray();
      let result = [];
      if (coll_main) {
        coll_main.forEach((resmain) => {
          if (resmain.name_data === "banyak_pinjaman") {
            let count1 = 0;
            let count2 = 0;
            let count3 = 0;
            coll_Sesi.forEach((resSesi) => {

              coll_Kendaraan.forEach((resasset) => {
                if (
                  resasset._id.toString() === resSesi._assetID.toString() &&
                  resasset.plat_nomor === resmain.name_param1
                ) {
                  count1 += 1;
                }
                if (
                  resasset._id.toString() === resSesi._assetID.toString() &&
                  resasset.plat_nomor === resmain.name_param2
                ) {
                  count2 += 1;

                }
                if (
                  resasset._id.toString() === resSesi._assetID.toString() &&
                  resasset.plat_nomor === resmain.name_param3
                ) {
                  count3 += 1;
                }
              });

            });
            result.push({
              _id: resmain._id,
              title: resmain.name_title,
              name_param: [resmain.name_param1, resmain.name_param2, resmain.name_param3],
              count: [count1, count2, count3]

            });

          }
        });
      }

      return res
        .status(200)
        .send(ApiResponse("Berhasil mendapatkan data", true, 200, result));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  CreateDataVisualPie: async (req, res) => {
    const data = {
      name_title: req.body.name_title,
      name_data: req.body.name_data,
      name_param1: req.body.name_param1,
      name_param2: req.body.name_param2,
      name_param3: req.body.name_param3,
      _userID: new ObjectId(req.session.userID.toString()),
    };
    try {
      const db = await connectToDatabase();
      const collection = db.collection("visual_pie");
      const count_pie_user = await collection
        .find({ _userID: req.session.userID.toString() })
        .toArray();
      if (count_pie_user.length >= 3) {
        return res
          .status(400)
          .send(
            ApiResponse(
              "Gagal membuat data, batas visual pie hanya 3",
              true,
              200,
              data
            )
          );
      }
      await collection.insertOne(data);
      return res
        .status(200)
        .send(ApiResponse("Berhasil membuat data", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },

  DeleteDataVisualPie: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("visual_pie");
      await collection.deleteOne({ _id: new ObjectId(req.params._id) });
      return res
        .status(200)
        .send(ApiResponse("Berhasil menghapus data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
