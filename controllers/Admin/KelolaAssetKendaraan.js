const { ObjectId, Timestamp } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const fs = require("fs");
const moment = require("moment");
const { count } = require("console");
const { param } = require("../../routes/routes");
module.exports = {
  DataAssetKendaraan: async (req, res) => {
    const returnFinal = [];
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const collection_sesi = db.collection("sesi_request_pinjam");

      const result = await collection.find().toArray();
      const result_sesi = await collection_sesi.find().toArray();

      await result.forEach((res) => {
        let count = 0;
        let status = null;

        result_sesi.find((ressi) => {
          if (res._id.toString() === ressi._assetID.toString()) {
            count += 1;
            if (ressi.status_sesi === "perjalanan") {
              status = "perjalanan";
            }
            if (ressi.status_sesi === "rusak") {
              status = "rusak";
            }
          }
        });
        returnFinal.push({
          _id: res._id,
          nama_kendaraan: res.nama_kendaraan,
          plat_nomor: res.plat_nomor,
          assetPath: res.assetPath,
          km: res.km,
          status: status,
          count: count,
        });
      });
      return res
        .status(200)
        .send(ApiResponse("Berhasil mendapatkan data", true, 200, returnFinal));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DataAssetSiap: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_assetID",
              as: "sesi_data",
            },
          },

          {
            $match: {
              "sesi_data.status_sesi": { $nin: ["perjalanan", "persiapan"] },
            },
          },
          {
            $project: {
              sesi_data: 0,
              bbm: 0,
              km: 0,
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
  DataAssetDetail: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const sesi_coll = db.collection("sesi_request_pinjam");
      const result_sesi = await sesi_coll.countDocuments({
        _assetID: new ObjectId(req.params._id),
      });
      const result = await collection
        .aggregate([
          {
            $match: {
              _id: new ObjectId(req.params._id), // Sesuaikan dengan cara mendapatkan ID asset yang benar
            },
          },
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_assetID",
              as: "sesi_data",
            },
          },
          {
            $unwind: {
              path: "$sesi_data",
              preserveNullAndEmptyArrays: true, // Menjaga elemen null (tanpa sesi_data)
            },
          },
          {
            $match: {
              $or: [
                { "sesi_data.assetID": null }, // Tampilkan jika tidak ada sesi_data
                { "sesi_data.status_sesi": "selesai" },
              ],
            },
          },
          {
            $group: {
              _id: "$_id", // Menggunakan _id asset sebagai _id grup
              nama_kendaraan: { $first: "$nama_kendaraan" },
              km: { $first: "$km" },
              plat_nomor: { $first: "$plat_nomor" },
              assetPath: { $first: "$assetPath" },
              count: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: [
                        "$sesi_data._assetID",
                        new ObjectId(req.params._id),
                      ],
                    },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
          {
            $project: {
              nama_kendaraan: 1,
              km: 1,
              plat_nomor: 1,
              assetPath: 1,
              assetID: "$_id", // Menyimpan _id asset sebagai assetID
              count: 1, // Menyimpan jumlah data sesi_data
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
  DataAssetDetailEtc: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_assetID",
              as: "sesi_data",
            },
          },
          {
            $lookup: {
              from: "request_pinjam",
              localField: "sesi_data._requestID",
              foreignField: "_id",
              as: "request_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "request_data._userID",
              foreignField: "_id",
              as: "peminjam_data",
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "peminjam_data._role",
              foreignField: "_id",
              as: "role_peminjam_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "sesi_data._pengemudiID",
              foreignField: "_id",
              as: "pengemudi_data",
            },
          },
          {
            $match: {
              "sesi_data.status_sesi": { $in: ["selesai"] },
              _id: { $in: [new ObjectId(req.params._id)] },
            },
          },
          {
            $project: {
              sesi_data: {
                status_sesi: 1,
                bbm: 1,
                jam_kembali: 1,
                waktu_tanggal_kembali: 1,
              },
              peminjam_data: { username: 1, profilPath: 1 },
              request_data: { waktu_jam: 1, waktu_tanggal: 1, keperluan: 1 },
              role_peminjam_data: { role: 1 },
              pengemudi_data: { username: 1 },
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
  CreateDataAssetKendaraan: async (req, res) => {
    try {
      const data = {
        nama_kendaraan: req.body.nama_kendaraan,
        plat_nomor: req.body.plat_nomor,
        km: parseInt(req.body.km),
        bbm: req.body.bbm,
        assetPath: req.files.assetPath[0].filename,
        create_at: moment().format("YYYY-MM-DD"),
      };
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const result = await collection.findOne({
        plat_nomor: data.plat_nomor,
      });

      if (result && result._id.toString() !== req.params._id) {
        fs.unlinkSync("./etc/uploads/" + req.files.assetPath[0].filename);
        return res
          .status(400)
          .send(
            ApiResponse(
              `Data sudah di gunakan pada mobil ${result.nama_kendaraan} , mohon cek kembali`,
              false,
              400,
              []
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
  EditDataAssetKendaraan: async (req, res) => {
    const data = {
      nama_kendaraan: req.body.nama_kendaraan,
      plat_nomor: req.body.plat_nomor,
      km: parseInt(req.body.km),
      bbm: parseInt(req.body.bbm),
    };
    if (req.files && req.files.assetPath && req.files.assetPath.length > 0) {
      data.assetPath = req.files.assetPath[0].filename;
    }
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const rescek = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!rescek) {
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
      }
      const result = await collection.findOne({
        plat_nomor: data.plat_nomor,
      });
      if (result && result._id.toString() !== req.params._id) {
        fs.unlinkSync("./etc/uploads/" + req.files.assetPath[0].filename);
        return res
          .status(400)
          .send(
            ApiResponse(
              `Data sudah di gunakan pada mobil ${result.nama_kendaraan} , mohon cek kembali`,
              false,
              400,
              []
            )
          );
      }
      if (data.assetPath) {
       
        const delFileOld = await collection.findOne({
          _id: new ObjectId(req.params._id),
        });
        if (delFileOld.assetPath) {
          fs.unlinkSync("./etc/uploads/" + delFileOld.assetPath);
        }
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
  DeleteDataAssetKendaraan: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("asset_kendaraan");
      const result = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!result) {
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
      }
      const delFileOld = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });

      if (delFileOld.assetPath) {
        fs.unlinkSync("./etc/uploads/" + delFileOld.assetPath);
      }
      await collection.deleteOne({ _id: new ObjectId(req.params._id) });
      return res
        .status(200)
        .send(ApiResponse("Berhasil menghapus data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
