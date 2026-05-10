const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
