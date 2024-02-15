const { ObjectId } = require("mongodb");
const { ApiResponse } = require("../../config/ApiResponse");
const { connectToDatabase } = require("../../config/database");

module.exports = {
  DataProfile: async (req, res) => {
    try {
      const db = await connectToDatabase();
      const collection = db.collection("user");
      const result = await collection
        .aggregate([
          { $lookup: {
            from:'role',
            localField: "_role",
            foreignField: "_id",
            as: "jabatan",
          }
        },{
          $match:{_id:new ObjectId(req.session.userID.toString())}
        },
        {
          $project:{
            _role:0,
            'jabatan._id': 0,
          }
        }
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
      _role: new ObjectId(req.body.role),
      profilePath: null,
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
