const { MongoClient } = require("mongodb");
require("dotenv").config();
const client = new MongoClient(process.env.DB_URI);

const connectToDatabase = async () => {
  try {
    await client.connect();

    return client.db(process.env.DB_NAME);
  } catch (error) {
    console.error("Gagal terhubung ke MongoDB ", error);
    throw error;
  }
};

module.exports = { connectToDatabase };
