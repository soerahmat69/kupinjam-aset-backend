const { ObjectId } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");
const { Client } = require("whatsapp-web.js");
const fs = require("fs")
const moment = require("moment");
module.exports = {
  DriverDataKeberangkatan: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const result = await collection
        .aggregate([
          {
            $match: {
              status_sesi: { $in: ["perjalanan", "persiapan", "selesai"] },
              _pengemudiID: new ObjectId(req.session.userID.toString()),
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
  DriverPilihPerjalanan: async (req, res) => {
    const data = {
      status_sesi: "perjalanan",
    };
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      const collRequest = db.collection("request_pinjam");
      const cek = collection.findOne({
        status_sesi: "perjalanan",
        _pengemudiID: new ObjectId(req.session.userID.toString()),
      });
      const getData = await collection.findOne({
        status_sesi: "persiapan",
        _id: new ObjectId(req.params._id),
      });
      if (cek.length > 0) {
        return res
          .status(400)
          .send(
            ApiResponse("Kamu masih dalam status perjalanan", false, 400, [])
          );
      }
      if (getData) {
        const getRequest = await collRequest.findOne({
          _id: new ObjectId(getData._requestID.toString()),
        });
        console.log(getRequest);
        if (!moment(getRequest.waktu_tanggal).isSame(moment(), "day")) {
          return res
            .status(400)
            .send(
              ApiResponse(
                "Kamu belum bisa terima, karena karena bukan hari ini",
                false,
                400,
                []
              )
            );
        }
      }

      await collection.updateOne(
        { _id: new ObjectId(req.params._id) },
        { $set: data }
      );
      return res
        .status(200)
        .send(ApiResponse("Berhasil edit data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  DriverTolakPerjalanan: async (req, res) => {
    const client = new Client();
    const data = {
      _pengemudiID: null,
      status_sesi: "Driver tolak",
    };
    try {
      const db = await connectToDatabase();
      const collection = db.collection("sesi_request_pinjam");
      if (client.authenticated) {
        client.sendMessage(
          "6282250743898@c.us",
          `halo koor, hari ini ada driver tolak perjalanan mohon di proses yaa`
        );
      }
      await collection.updateOne(
        { _id: new ObjectId(req.params._id) },
        { $set: data }
      );
      return res
        .status(200)
        .send(ApiResponse("Berhasil edit data", true, 200, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  EditDataKeberangkatan: async (req, res) => {
    try {
  
      const data = {
        _assetID: new ObjectId(req.body._assetID),
        _requestID: new ObjectId(req.body._requestID),
        _pengemudiID: new ObjectId(req.body._pengemudiID),
        sesi_kondisi_pergi: {
          kondisi: req.body.kondisi_pergi,
          kendala: req.body.kendala_pergi,
          km:
            req.body.km_pergi === "null" || req.body.km_pergi === "undefined"
              ? null
              : parseInt(req.body.km_pergi),
        },
        sesi_kondisi_kembali: {
          kondisi: req.body.kondisi_kembali,
          kendala: req.body.kendala_kembali,
          km:
            req.body.km_kembali === "null" ||
            req.body.km_kembali === "undefined"
              ? null
              : parseInt(req.body.km_kembali),
        },
        status_sesi: req.body.status_sesi,
        bbm:
          req.body.bbm === "null" || req.body.bbm === "undefined"
            ? null
            : parseInt(req.body.bbm),
        jam_kembali:
          req.body.jam_kembali === "null" ||
          req.body.jam_kembali === "undefined"
            ? null
            : req.body.jam_kembali,
        waktu_tanggal_kembali:
          req.body.waktu_tanggal_kembali === "null" ||
          req.body.waktu_tanggal_kembali === "undefined"
            ? null
            : moment(req.body.waktu_tanggal_kembali).format("YYYY-MM-DD"),
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
      if (
        data.strukPath &&
        fs.existsSync(`./etc/uploads/${rescek.strukPath}`)
      ) {
        fs.unlinkSync("./etc/uploads/" + rescek.strukPath);
      }
      await collection.updateOne(
        { _id: new ObjectId(req.params._id) },
        { $set: data }
      );
      return res
        .status(200)
        .send(ApiResponse("Berhasil memperbaharui informasi", true, 200, data));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
};
