const { ObjectId } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const { Client } = require("whatsapp-web.js");
const moment = require("moment");
module.exports = {
  DriverDataDashboard: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const asset_coll = db.collection("asset_kendaraan");
      const sesi_coll = db.collection("sesi_request_pinjam");  
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
          $match: { "sesi_data.status_sesi": {$nin:["perjalanan"]} },
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
      
      
      const status_digunakan = await sesi_coll.countDocuments({
        status_sesi: { $in: ["perjalanan"] },
      });
      const perjalanan_count = await sesi_coll.countDocuments({
        status_sesi: {
          $in: ["selesai"],
        },
        _pengemudiID: new ObjectId(req.session.userID.toString()),
      });
      const status_rusak = await sesi_coll.countDocuments({
        $or: [
          { "sesi_kondisi_pergi.kondisi": "tidak" },
          { "sesi_kondisi_kembali.kondisi": "tidak" },
        ],
      });
      const visualChart = await sesi_coll.aggregate([
        {
          $match: {
            _pengemudiID: new ObjectId(req.session.userID.toString()),
            action_date: {
              $lte: moment().format("YYYY-MM-DD"),
              $gte: moment()
                .subtract(parseInt(req.params._YYYY), "year")
                .subtract(parseInt(req.params._MM), "month")
                .set("date", 1)
                .format("YYYY-MM-DD"),
            },
          },
        },
        {
          $group: {
            _id: "$action_date",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            action_date: "$_id",
            count: 1,
          },
        },
      ]).toArray();
      
      const asset_count = await asset_coll.countDocuments();
      return res.status(200).send(
        ApiResponse("Berhasil mendapatkan data", true, 200, 
        [
          {
            totalitas: {
              perjalanan: perjalanan_count,
            },
            status_kendaraan: {
              status_digunakan: status_digunakan,
              status_tidak_terpakai : status_tidak_terpakai[0].count,
              status_rusak: status_rusak,
            },
            DataChart: visualChart,
          },
        ]
        )
      );
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  PinjamAsetApi: async (req, res) => {
    try {
      const client = new Client();
      const db = await connectToDatabase();
      const cekPinjam = db.collection("request_pinjam");
      const cekPinjamValid = await cekPinjam.findOne({
        _userID: new ObjectId(req.session.userID.toString()),
        status: "pending",
      });
      if (cekPinjamValid) {
        return res
          .status(400)
          .send(
            ApiResponse(
              "Gagal, pinjaman tidak boleh lebih dari 1",
              true,
              400,
              []
            )
          );
      }
      const usercek = db.collection("user");
      const cekUser = await usercek.findOne({
        _id: new ObjectId(req.session.userID.toString()),
      });
      const data = {
        _userID: new ObjectId(req.session.userID.toString()),
        keperluan: req.body.keperluan,
        waktu_jam: req.body.waktu_jam,
        waktu_pinjam: req.body.waktu_pinjam,
        status: "pending",
        waktu_tanggal: new Date(req.body.waktu_tanggal)
          .toISOString()
          .slice(0, 10),
        action_date: moment().format("YYYY-MM-DD"),
      };
      const collection = db.collection("request_pinjam");

      const result = await collection.insertOne(data);
      if (client.authenticated) {
        client.sendMessage(
          "6282250743898@c.us",
          `halo koor, hari ini ada yang minjem nih atas nama ${cekUser.username} mohon di proses yaa`
        );
      }
      return res
        .status(200)
        .send(ApiResponse("Berhasil menambahkan data", true, 200, result));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  PeminjamDataRequest: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "user",
              localField: "_userID",
              foreignField: "_id",
              as: "user_data",
            },
          },
          {
            $match: {
              status: "pending",
              _userID: new ObjectId(req.session.userID.toString()),
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "user_data._role",
              foreignField: "_id",
              as: "role_data",
            },
          },
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_requestID",
              as: "sesi_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "sesi_data._pengemudiID",
              foreignField: "_id",
              as: "pengemudi",
            },
          },
          {
            $project: {
              _userID: 0,
              user_data: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              role_data: { _id: 0 },
              sesi_data: {
                _id: 0,
                action_date: 0,
                _pengemudiID: 0,
                _requestID: 0,
              },
              pengemudi: { _id: 0, _role: 0, password: 0, no_wa: 0 },
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
  PeminjamDataRequestSelesai: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "user",
              localField: "_userID",
              foreignField: "_id",
              as: "user_data",
            },
          },
          {
            $match: {
              status: { $in: ["setuju", "batal"] },
              _userID: new ObjectId(req.session.userID.toString()),
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "user_data._role",
              foreignField: "_id",
              as: "role_data",
            },
          },
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_requestID",
              as: "sesi_data",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "sesi_data._pengemudiID",
              foreignField: "_id",
              as: "pengemudi",
            },
          },
          {
            $project: {
              _userID: 0,
              user_data: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              role_data: { _id: 0 },
              sesi_data: {
                _id: 0,
                action_date: 0,
                _pengemudiID: 0,
                _requestID: 0,
              },
              pengemudi: { _id: 0, _role: 0, password: 0, no_wa: 0 },
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
  PeminjamDeleteDataRequest: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const result = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!result) {
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
  PeminjamEditDataRequest: async (req, res) => {
    try {
      const data = {
        _userID: new ObjectId(req.session.userID.toString()),
        keperluan: req.body.keperluan,
        waktu_jam: req.body.waktu_jam,
        waktu_pinjam: req.body.waktu_pinjam,
        status: "pending",
        waktu_tanggal: new Date(req.body.waktu_tanggal)
          .toISOString()
          .slice(0, 10),
        action_date: moment().format("YYYY-MM-DD"),
      };
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const rescek = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!rescek) {
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
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
  PeminjamCancelDataRequest: async (req, res) => {
    try {
      const data = {
        status: "batal",
        action_date: moment().format("YYYY-MM-DD"),
      };
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const rescek = await collection.findOne({
        _id: new ObjectId(req.params._id),
      });
      if (!rescek) {
        return res
          .status(200)
          .send(ApiResponse("Data tidak di ketahui", true, 200, []));
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
};
