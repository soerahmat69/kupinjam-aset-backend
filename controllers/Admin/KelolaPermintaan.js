const { ObjectId, Timestamp } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const fs = require("fs");
const { connectToDatabase } = require("../../config/database");
const moment = require("moment");
module.exports = {
  DataRequest: async (req, res) => {
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
              status: "proses",
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
            $sort: { _id: -1 },
          },
          {
            $project: {
              _userID: 0,
              user_data: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              role_data: { _id: 0 },
              sesi_data: 0,
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
  DataRequestSelesai: async (req, res) => {
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
              status: "setuju",
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
          { $sort: { _id: -1 } },
          {
            $project: {
              _userID: 0,
              user_data: { _id: 0, _role: 0, password: 0, no_wa: 0 },
              role_data: { _id: 0 },
              sesi_data: 0,
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
  DataRequestBatal: async (req, res) => {
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
              status: "batal",
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
              sesi_data: 0,
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
  DataRequestTolak: async (req, res) => {
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
              status: "Driver tolak",
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
              sesi_data: 0,
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
  CreateDataRequest: async (req, res) => {
    try {
      const data = {
        _userID: new ObjectId(req.body._userID),
        keperluan: req.body.keperluan,
        waktu_jam: req.body.waktu_jam,
        waktu_pinjam: req.body.waktu_pinjam,
        status: "proses",
        waktu_tanggal: new Date(req.body.waktu_tanggal)
          .toISOString()
          .slice(0, 10),
        action_date: moment().format("YYYY-MM-DD"),
        create_at: moment().format("YYYY-MM-DD"),
      };
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      await collection.insertOne(data);

      return res
        .status(200)
        .send(ApiResponse("Berhasil membuat data", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  EditDataRequest: async (req, res) => {
    try {
      const data = {
        keperluan: req.body.keperluan,
        waktu_jam: req.body.waktu_jam,
        waktu_pinjam: req.body.waktu_pinjam,
        status: req.body.status,
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
  DeleteDataRequest: async (req, res) => {
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
      const sesi_collection = db.collection("sesi_request_pinjam");
      const get_sesi = await sesi_collection.findOne({
        _requestID: new ObjectId(req.params._id),
      });
      if (get_sesi) {
        if (
          get_sesi.strukPath &&
          fs.existsSync(`./etc/uploads/${get_sesi.strukPath}`)
        ) {
          fs.unlinkSync("./etc/uploads/" + get_sesi.strukPath);
        }
        await sesi_collection.deleteOne({
          _id: new ObjectId(get_sesi._id.toString()),
        });
      }
      await collection.deleteOne({ _id: new ObjectId(req.params._id) });
      return res
        .status(200)
        .send(ApiResponse("Berhasil menghapus data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DataRequestTotalitas: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("request_pinjam");
      const result_top_list = await collection
        .aggregate([
          {
            $match: {
              status: "setuju", // Menyaring hanya data dengan status "pending"
            },
          },
          {
            $group: {
              _id: "$_userID",
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "_id",
              foreignField: "_id",
              as: "peminjam",
            },
          },
          {
            $unwind: "$peminjam", // Mengembalikan array hasil dari $lookup menjadi dokumen terpisah
          },
          {
            $lookup: {
              from: "role",
              localField: "peminjam._role",
              foreignField: "_id",
              as: "jabatan",
            },
          },
          {
            $limit: 3,
          },
          {
            $project: {
              count: 1,
              _id: 0,
              username: "$peminjam.username",
              jabatan: {
                role: "$jabatan.role",
              },
            },
          },
        ])
        .toArray();

      const result_totalitas_pending = await collection.countDocuments({
        status: "proses",
      });
      const result_totalitas_setujui = await collection.countDocuments({
        status: "setuju",
      });
      const result_totalitas_pinjaman = await collection.countDocuments();
      return res.status(200).send(
        ApiResponse("Berhasil mendapatkan data", true, 200, [
          {
            totalitas: [
              { peminjam: result_totalitas_pinjaman },
              { setujui: result_totalitas_setujui },
              { pending: result_totalitas_pending },
            ],
            top_list: result_top_list,
          },
        ])
      );
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
