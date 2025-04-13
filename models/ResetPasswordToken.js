const mongoose = require("mongoose");

const ResetPasswordTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    default: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
  },
});

module.exports = mongoose.model("ResetPasswordToken", ResetPasswordTokenSchema);
