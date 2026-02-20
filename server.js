require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const connectDB = require("./Dbconnection/Dbconn");
const User = require("./Models/userModel");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./Routes/authRoute"));
app.use ("/service" ,require("./Routes/serviceRoute"));
app.use ("/quote" ,require("./Routes/quoteRoute"));
app.use("/contact", require("./Routes/contactRoute"));

// AUTO CREATE ADMIN IF NOT EXISTS
const createAdmin = async () => {
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully ");
  } else {
    console.log("Admin already exists ");
  }
};

app.listen(5000, async () => {
  console.log("Server running on port 5000");
  await createAdmin();
});