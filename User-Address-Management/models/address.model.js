const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" },
  pincode: { type: String, required: true },
});

module.exports = mongoose.model("Address", addressSchema);
