const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("ResetToken", resetTokenSchema);
