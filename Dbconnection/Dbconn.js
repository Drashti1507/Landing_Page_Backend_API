const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "myDatabase";

let db;

function connectDB() {
  const client = new MongoClient(url);

  return client.connect()
    .then(() => {
      console.log(" MongoDB Connected Successfully");
      db = client.db(dbName);
      return db;
    })
    .catch((error) => {
      console.error("MongoDB Connection Failed:", error.message);
      process.exit(1);
    });
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

module.exports = {
  connectDB,
  getDB,
};
