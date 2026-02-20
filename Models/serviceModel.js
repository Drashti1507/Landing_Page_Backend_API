const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);