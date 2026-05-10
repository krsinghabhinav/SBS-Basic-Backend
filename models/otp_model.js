
const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phone: { type: String, unique: true },
    password: String,
    address: String,
    gender: String,

    isVerified: { type: Boolean, default: false },

    otp: String,
    otpExpiry: Date
});



module.exports = mongoose.model("otp", otpSchema);
