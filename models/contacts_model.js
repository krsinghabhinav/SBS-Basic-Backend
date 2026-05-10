const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    image: {
      type: String,
    },

    imageId: {
      type: String,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
