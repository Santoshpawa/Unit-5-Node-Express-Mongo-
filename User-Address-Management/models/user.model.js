const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  age: { type: Number, required: true },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
});

module.exports = mongoose.model("User", userSchema);
