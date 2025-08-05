const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, default: "available" }, // available, borrowed, reserved
  borrowerName: { type: String, default: null },
  borrowDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  returnDate: { type: Date, default: null },
  overdueFees: { type: Number, default: 0 },
});

const Library = mongoose.model("Library", librarySchema);
module.exports = Library;
