// models.js
const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Publisher name required"],
    unique: true,
    trim: true,
  },
  location: { type: String, trim: true },
  yearEstablished: {
    type: Number,
    min: [1950, "yearEstablished must be >= 1950"],
  },
});

const VALID_GENRES = ["RPG", "Action", "Adventure", "Strategy", "Sports"];

const gameSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Game title required"], trim: true },
  genre: {
    type: String,
    enum: {
      values: VALID_GENRES,
      message: "Genre must be one of " + VALID_GENRES.join(", "),
    },
  },
  releaseDate: { type: Date },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher",
    required: [true, "Publisher reference required"],
  },
});

const Publisher = mongoose.model("Publisher", publisherSchema);
const Game = mongoose.model("Game", gameSchema);

module.exports = { Publisher, Game };
