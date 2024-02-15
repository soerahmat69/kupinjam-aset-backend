const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { CheckValidationAuth } = require("./config/Checker");
const { Login, Logout } = require("./controllers/Auth");

const router = require("./routes/routes");
const { connectToDatabase } = require("./config/database");
const { ApiResponse } = require("./config/ApiResponse");
const app = express();
const {PinjamAset} = require('./controllers/Peminjam/UserRequest')
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "keyboard cat",
    name: "gen",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 * 60 * 2 },
  })
);
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use('/etc/images', express.static('./etc/uploads'))
app.post("/login", CheckValidationAuth, Login);
app.post("/logout", Logout);

app.use("/", router);

const client = new Client();
const cekUser = async (param) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("user");
    const ret = await collection.findOne({ no_wa: parseInt(param) });
    if (ret) {
      return "aman";
    } else {
      return "Maaf nomor kamu tidak di kenal";
    }
  } catch (error) {
    return error;
  }
};
app.get('/test', (req, res) => {
  res.status(400).send('Hello, World!');
});
app.get('/a', (req, res) => {
  res.status(400).send('Hello, World!');
});
router.get("/req/wa", async (req, res) => {
  try {
    client.initialize();
    let qr = await new Promise((resolve, reject) => {
      client.once("qr", (qr) => resolve(qr));
      setTimeout(() => {
        reject(new Error("QR event wasn't emitted in 15 seconds."));
      }, 25000);
    });
    return res
      .status(200)
      .send(ApiResponse("Berhasil melakukan login", true, 200, [{ qrWa: qr }]));
  } catch (err) {
    return res.status(500).json({ message: "Ada problem nih " + err });
  }
});
 
const regexPattern =
  /^saya pinjam untuk keperluan (.+) di jam (.+) tanggal (.+)$/i;

client.on("message", async (message) => {
  const userPhone = message.from;
  const getNumPhone = userPhone.replace(/\D/g, "");
  const cekuser = await cekUser(getNumPhone);

  if (message.body.toLowerCase().startsWith("saya pinjam untuk keperluan")) {
    const match = message.body.match(regexPattern);
    if (match) {
      const dataPesan = {
        keperluan: match[1],
        jam: match[2],
        tanggal: match[3],
      };
      const data = await PinjamAset(getNumPhone, dataPesan);
      message.reply(data);
     
    } else {
      message.reply(
        "Format pesan tidak sesuai. Silakan gunakan format: 'saya pinjam untuk keperluan <keperluan> di jam <jam> tanggal <tanggal>'"
      );
    }
  }
});

client.on("disconnected", (reason) => {
  console.log("Client is disconnected:", reason);
});
client.initialize();

app.listen(process.env.PORT, () => {
  console.log("Server Berjalan di Port : http://localhost:8080/");
});

module.exports = app