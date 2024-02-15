const { connectToDatabase } = require("../config/database");
const { ApiResponse } = require("../config/ApiResponse.js");
const { ObjectId } = require("mongodb");
const moment = require('moment')

module.exports = {
  Login: async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const collection_role = db.collection("role");
      const result = await collection.findOne({username:username,password:password})
      const result_no_wa = await collection.findOne({no_wa:username,password:password})
      if (result) {
        const result_role = await collection_role.findOne({_id:new ObjectId(result._role)})
        req.session.userID = result._id;
        req.session.isLogin = true;
        req.session.role = result_role.role.toString();
        return res
          .status(200)
          .send(ApiResponse("Berhasil melakukan login", true, 200, result));
      }
      if (result_no_wa) {
        const result_role = await collection_role.findOne({_id:new ObjectId(result_no_wa._role)})
        req.session.userID = result_no_wa._id;
        req.session.isLogin = true;
        req.session.role = result_role.role;
        return res
          .status(200)
          .send(ApiResponse("Berhasil melakukan login", true, 200, result_no_wa));
      }
        return res
        .status(400)
        .send(ApiResponse("Username atau password salah ", false, 400, []));
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  Logout: async (req, res) => {
    req.session.destroy()
      return res
        .status(200)
        .send(
          ApiResponse(
            "Logout berhasil ",
            false,
            200,
            []
          )
        );
  },
  VerifyUser: async (req, res, next) => {
    const username = req.body.username;
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection.findOne({
        username: username,
        verify: false,
      });
      if (result) {
        return res
          .status(400)
          .send(
            ApiResponse(
              "Verify dulu baru bisa login, lapor ke admin 🙈 ",
              false,
              400,
              []
            )
          );
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Ada problem nih " + error });
    }
  },
  ValidRoleAdmin: async (req, res, next) => {
    if (req.session.role !== "admin") {
      return res
        .status(400)
        .send(ApiResponse("Dilarang ke sini admin punya 🙈 ", false, 400, []));
    }
    next();
  },
  ValidRolePeminjam: async (req, res, next) => {
    if (req.session.role !== "karyawan") {
      return res
        .status(400)
        .send(
          ApiResponse(
            "Dilarang ke sini ya min Peminjam punya 🙈 ",
            false,
            400,
            []
          )
        );
    }
    next();
  },
  ValidRoleDriver: async (req, res, next) => {
    if (req.session.role !== "pengemudi") {
      return res
        .status(400)
        .send(
          ApiResponse(
            "Dilarang ke sini ya min Driver punya 🙈 ",
            false,
            400,
            []
          )
        );
    }
    next();
  },
  ValidUserSess: async (req, res, next) => {
    console.log(req.session.userID +" "+ moment().format("HH:mm:ss"))
    if (!req.session.isLogin) {
      return res
        .status(400)
        .send(
          ApiResponse(
            " sesi akun kamu uzur,login lagi ya 🙊 ",
            false,
            400,
            []
          )
        );
    }
    next();
  },
};
