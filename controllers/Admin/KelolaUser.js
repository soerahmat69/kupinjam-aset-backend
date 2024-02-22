const { ObjectId } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const moment = require('moment')
module.exports = {
  DataUser: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection
        .aggregate([

          {
            $lookup: {
              from: "request_pinjam",
              localField: "_id",
              foreignField: "_userID",
              as: "request_data",
            },
          },
          {
            $unwind: {
              path: "$request_data",
              preserveNullAndEmptyArrays: true, // Menjaga elemen null (tanpa sesi_data)
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "_role",
              foreignField: "_id",
              as: "jabatan",
            },
          },
          {
            $match: {
              $or: [
                { "request_data.userID": null }, // Tampilkan jika tidak ada sesi_data
                { "request_data.status": "setuju" },
              ],
            },
          },
          { $sort: { _id: -1 } },
          {
            $group: {
              _id: "$_id", // Menggunakan _id asset sebagai _id grup
              username: { $first: "$username" },
              password: { $first: "$password" },
              profilePath: { $first: "$profilPath" },
              jabatan: { $first: "$jabatan.role" },
              no_wa: { $first: "$no_wa" },
              count: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$request_data._userID", "$_id"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        {$sort:{_id:-1}},
          {
            $project: {
              jabatan: 1,
              username: 1,
              password: 1,
              profilPath: 1,
              no_wa: 1,
              user: "$_id",
              count: 1,
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
  DataUserSearch: async (req, res) => {
    const {keyword} = req.body
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection
        .aggregate([

          {
            $lookup: {
              from: "request_pinjam",
              localField: "_id",
              foreignField: "_userID",
              as: "request_data",
            },
          },
          {
            $unwind: {
              path: "$request_data",
              preserveNullAndEmptyArrays: true, // Menjaga elemen null (tanpa sesi_data)
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "_role",
              foreignField: "_id",
              as: "jabatan",
            },
          },
          {
            $match: {
              $or: [
                { "request_data.userID": null }, // Tampilkan jika tidak ada sesi_data
                { "request_data.status": "setuju" },
              ],
              $or: [
                { "username": { $regex: keyword, $options: 'i' } }, // Pencarian username
                // { "status": { $regex: keyword, $options: 'i' } }, // Pencarian jabatan
                // Tambahkan bidang lain yang ingin Anda cari di sini
              ],
            },
          },
          { $sort: { _id: -1 } },
          {
            $group: {
              _id: "$_id", // Menggunakan _id asset sebagai _id grup
              username: { $first: "$username" },
              password: { $first: "$password" },
              profilePath: { $first: "$profilPath" },
              jabatan: { $first: "$jabatan.role" },
              no_wa: { $first: "$no_wa" },
              count: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$request_data._userID", "$_id"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        {$sort:{_id:-1}},
          {
            $project: {
              jabatan: 1,
              username: 1,
              password: 1,
              profilPath: 1,
              no_wa: 1,
              user: "$_id",
              count: 1,
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
  DataUserPeminjam: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "role",
              localField: "_role",
              foreignField: "_id",
              as: "jabatan",
            },
          },
          {
            $match: {
              "jabatan.role": { $nin: ["satpam", "pengemudi"] },
            },
          },
          {
            $project: {
              password: 0,
              _role: 0,
              "jabatan._id": 0,
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
  DataUserPengemudi: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "sesi_request_pinjam",
              localField: "_id",
              foreignField: "_pengemudiID",
              as: "sesi_data",
            },
          },
          {
            $lookup: {
              from: "role",
              localField: "_role",
              foreignField: "_id",
              as: "role_data",
            },
          },
          {
            $match: {
              "sesi_data.status_sesi": { $nin: ["perjalanan", "persiapan"] },
              "role_data.role": { $in: ["pengemudi"] },
            },
          },
          {
            $project: {
              password: 0,
              _role: 0,
              sesi_data: 0,
              role_data: { _id: 0 },
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
  CreateDataUser: async (req, res) => {
    const data = {
      username: req.body.username,
      password: req.body.password,
      no_wa: parseFloat(req.body.no_wa),
      _role: new ObjectId(req.body._role),
      profilePath: null,
      create_at: moment().format("YYYY-MM-DD"),
    };

    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection.findOne({
        username: data.username,
        no_wa: data.no_wa,
      });
      if (result) {
        return res
          .status(400)
          .send(ApiResponse("Data sudah di gunakan", false, 400, []));
      }
      collection.insertOne(data);
      return res
        .status(200)
        .send(ApiResponse("Akun sudah bisa di gunakan", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  EditDataUser: async (req, res) => {
    const data = {
      username: req.body.username,
      password: req.body.password,
      no_wa: parseFloat(req.body.no_wa),
      _role: new ObjectId(req.body._role),
    };

    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result =
        (await collection.findOne({
          no_wa: parseInt(data.no_wa),
        })) ||
        (await collection.findOne({
          username: data.username,
        }));
      if (result && result._id.toString() !== req.params._id) {
        return res
          .status(400)
          .send(
            ApiResponse(
              `Data sudah di gunakan atas nama ${result.username} , mohon cek kembali`,
              false,
              400,
              []
            )
          );
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
  DeleteDataUser: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      await collection.deleteOne({ _id: new ObjectId(req.params._id) });
      return res
        .status(200)
        .send(ApiResponse("Berhasil menghapus data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
