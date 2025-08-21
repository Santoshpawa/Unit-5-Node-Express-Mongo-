const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user = new Schema({
  username: String,
  email: String,
  password: String,
  role: String,
});

const post = new Schema({
  title: String,
  content: String,
});

const User = mongoose.model("User", user);
const Post = mongoose.model("Post", post);

module.exports = { User, Post };
