// server.js
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const routes = require("./routes");

app.use(express.json());
app.use("/", routes);

mongoose
  .connect("mongodb://localhost:27017/book-rental-system")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.error("DB connection error:", err));
