const { ObjectId, Timestamp } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const fs  = require("fs")
const moment = require("moment");
module.exports = {
  DataSesiPenggunaan: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const result = await collection
        .aggregate([
          {
            $match: {
              status_sesi: { $in: ["perjalanan", "persiapan", "Driver tolak"] },
            },
          },
          {
            $lookup: {
              from: "request_pinjam",
              localField: "_requestID",
              foreignField: "_id",
              as: "request_data",
            },
          },
          {
            $lookup: {
              from: "asset_kendaraan",
              localField: "_assetID",
              foreignField: "_id",
              as: "asset_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "_pengemudiID",
              foreignField: "_id",
              as: "pengemudi_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "request_data._userID",
              foreignField: "_id",
              as: "peminjam",
            },
          },

          {
            $lookup: {
              from: "role",
              localField: "peminjam._role",
              foreignField: "_id",
              as: "peminjam_role",
            },
          },
          { $unwind: "$peminjam_role" },
          {$sort:{_id:-1}},
          {
            $project: {
              peminjam: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              request_data: { _id: 0 },
              pengemudi_data: {
                _id: 0,
                _role: 0,
                password: 0,
                no_wa: 0,
              },
              peminjam_role: { _id: 0 },
            },
          },
        ])
        .toArray();
      return res
        .status(200)
        .send(ApiResponse("Berhasil mendapatkan data", true, 200, result));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  CreateDataSesiPenggunaan: async (req, res) => {
    const data = {
      _assetID: new ObjectId(req.body._assetID),
      _requestID: new ObjectId(req.body._requestID),
      _pengemudiID: new ObjectId(req.body._pengemudiID),
      sesi_kondisi_pergi: {
        kondisi: req.body.kondisi_pergi,
        kendala: req.body.kendala_pergi,
        km: req.body.km_pergi,
      },
      sesi_kondisi_kembali: {
        kondisi: req.body.kondisi_kembali,
        kendala: req.body.kendala_kembali,
        km: req.body.km_kembali,
      },
      status_sesi: "persiapan",
      bbm: req.body.bbm,
      waktu_kembali: {
        jam_kembali: req.body.jam_kambali,
        tanggal_kembali: req.body.tanggal_kembali,
      },
      strukPath: null,
      action_date: moment().format("YYYY-MM-DD"),
      create_at: moment().format("YYYY-MM-DD"),
    };
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const req_coll = db.collection("request_pinjam");
      await req_coll.updateOne(
        { _id: new ObjectId(req.body._requestID) },
        {
          $set: {
            status: "setuju",
          },
        }
      );
      await collection.insertOne(data);
      return res
        .status(200)
        .send(ApiResponse("Berhasil membuat data", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  EditDataSesiPenggunaan: async (req, res) => {
 
    try {
      console.log(req.body.waktu_tanggal_kembali)
    const data = {
      _assetID: new ObjectId(req.body._assetID),
      _requestID: new ObjectId(req.body._requestID),
      _pengemudiID: new ObjectId(req.body._pengemudiID),
      sesi_kondisi_pergi: {
        kondisi: req.body.kondisi_pergi,
        kendala: req.body.kendala_pergi,
        km: req.body.km_pergi === "null" || req.body.km_pergi === "undefined"?null :  parseInt(req.body.km_pergi),
      },
      sesi_kondisi_kembali: {
        kondisi: req.body.kondisi_kembali,
        kendala: req.body.kendala_kembali,
        km: req.body.km_kembali === "null" || req.body.km_kembali === "undefined" ? null :parseInt(req.body.km_kembali),
      },
      status_sesi: req.body.status_sesi,
      bbm: req.body.bbm === "null" || req.body.bbm ==="undefined" ?null: parseInt(req.body.bbm),
      jam_kembali: req.body.jam_kembali === "null" || req.body.jam_kembali === "undefined" ? null: req.body.jam_kembali,
      waktu_tanggal_kembali: req.body.waktu_tanggal_kembali=== "null" || req.body.waktu_tanggal_kembali === "undefined" ? null:  new Date(req.body.waktu_tanggal_kembali).toISOString().slice(0, 10)
      || "",    
      action_date: moment().format("YYYY-MM-DD"),
    };
    if (req.files && req.files.strukPath && req.files.strukPath.length > 0) {
      data.strukPath = req.files.strukPath[0].filename;
    }
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");

      const rescek = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!rescek) {
        fs.unlinkSync("./etc/uploads/" + req.files.strukPath[0].filename);
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
      }
      if (data.strukPath && fs.existsSync(`./etc/uploads/${rescek.strukPath}`)) {
        fs.unlinkSync("./etc/uploads/" + rescek.strukPath);
      }
      await collection.updateOne(
        { _id: new ObjectId(req.params._id) },
        { $set: data }
      );
      return res
        .status(200)
        .send(ApiResponse("Berhasil mengubah data", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DeleteDataSesiPenggunaan: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const rescek = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!rescek) {
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
      }
      await collection.deleteOne({ _id: new ObjectId(req.params._id) });
      return res
        .status(200)
        .send(ApiResponse("Berhasil menghapus data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DataSesiPenggunaanSelesai: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const result = await collection
        .aggregate([
          {
            $match: {
              status_sesi: { $in: ["selesai"] },
            },
          },
          {
            $lookup: {
              from: "request_pinjam",
              localField: "_requestID",
              foreignField: "_id",
              as: "request_data",
            },
          },
          {
            $lookup: {
              from: "asset_kendaraan",
              localField: "_assetID",
              foreignField: "_id",
              as: "asset_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "_pengemudiID",
              foreignField: "_id",
              as: "pengemudi_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "request_data._userID",
              foreignField: "_id",
              as: "peminjam",
            },
          },

          {
            $lookup: {
              from: "role",
              localField: "peminjam._role",
              foreignField: "_id",
              as: "peminjam_role",
            },
          },
          { $unwind: "$peminjam_role" },
          {
            $project: {
              peminjam: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              request_data: { _id: 0 },
              pengemudi_data: {
                _id: 0,
                _role: 0,
                password: 0,
                no_wa: 0,
              },
              peminjam_role: { _id: 0 },
            },
          },
        ])
        .toArray();
      return res
        .status(200)
        .send(ApiResponse("Berhasil mendapatkan data", true, 200, result));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
