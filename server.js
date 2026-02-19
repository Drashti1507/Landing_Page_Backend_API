require("dotenv").config(); 

const express = require("express");
const { connectDB } = require("./Dbconnection/Dbconn");
const userRoutes = require("./Routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5050;

function startServer() {
  connectDB()
    .then(() => {
      console.log("Database Connected");
      app.listen(PORT, () => {
        console.log(` Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

startServer();
