const { ObjectId } = require("mongodb");
const {ApiResponse} = require("../../config/ApiResponse")
const { connectToDatabase } = require("../../config/database");
const { Client } = require("whatsapp-web.js");
const moment = require("moment");
module.exports={
     PinjamAset : async (param, dataPesan) => {
        try {
          const db = await connectToDatabase();
          const cekuser = db.collection("user");
          const cekUserValid = await cekuser.findOne({ no_wa: parseInt(param) });
          if (!cekUserValid) {
            return "Maaf nomor kamu tidak di kenali";
          }
          const data = {
            _userID: cekUserValid._id,
            keperluan: dataPesan.keperluan,
            waktu_jam: dataPesan.jam,
            status: "proses",
            waktu_tanggal: new Date(dataPesan.tanggal).toISOString().slice(0, 10),
            action_date: moment().format("YYYY-MM-DD"),
          };
          const collection = db.collection("request_pinjam");
          await collection.insertOne(data);
       
          return `Terimakasih ${cekUserValid.username}, pinjaman akan saya kabari lagi`;
        } catch (error) {
          console.log(error)
        }
      },
      PinjamAsetApi : async (req, res) => {
        try {
          const client = new Client()
          const db = await connectToDatabase();
          const cekPinjam = db.collection("request_pinjam");
          const cekPinjamValid = await cekPinjam.findOne({ _userID: new ObjectId(req.session.userID.toString()),status:"proses" });
          if (cekPinjamValid) {
            return res
            .status(400)
            .send(ApiResponse("Gagal, pinjaman tidak boleh lebih dari 1", true, 400, []));
          }
          const usercek = db.collection("user")
          const cekUser = await usercek.findOne({_id: new ObjectId(req.session.userID.toString())})
          const data = {
            _userID: new ObjectId(req.session.userID.toString()),
            keperluan: req.body.keperluan,
            waktu_jam: req.body.waktu_jam,
            waktu_pinjam: req.body.waktu_pinjam,
            status: "proses",
            waktu_tanggal: new Date(req.body.waktu_tanggal)
              .toISOString()
              .slice(0, 10),
            action_date: moment().format("YYYY-MM-DD"),
          };
          const collection = db.collection("request_pinjam");
      
       
          const result = await collection.insertOne(data);
          if (client.authenticated) {
            client.sendMessage("6282250743898@c.us", `halo koor, hari ini ada yang minjem nih atas nama ${cekUser.username} mohon di proses yaa`);
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
                status: "proses",
                _userID: new ObjectId(req.session.userID.toString())
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
                sesi_data: {_id:0,action_date:0,_pengemudiID:0,_requestID:0},
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
                status:  { $in: ["setuju", "batal"] },
                _userID: new ObjectId(req.session.userID.toString())
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
                sesi_data: {_id:0,action_date:0,_pengemudiID:0,_requestID:0},
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
            waktu_pinjam:req.body.waktu_pinjam,
            status: "proses",
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
}