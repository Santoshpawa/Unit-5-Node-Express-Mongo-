const mongoose = require("mongoose");
const validator = require("validator");

const profileSchema = new mongoose.Schema(
  {
    profileName: {
      type: String,
      required: true,
      enum: ["fb", "twitter", "github", "instagram"],
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: (val) => validator.isURL(val),
        message: "Invalid URL format",
      },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (val) => validator.isEmail(val),
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters long"],
  },
  profiles: [profileSchema],
});

module.exports = mongoose.model("User", userSchema);
