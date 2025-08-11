// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");

const app = express();
app.use(express.json());

// Global custom middleware: add requestTimestamp
app.use((req, res, next) => {
  req.requestTimestamp = new Date().toISOString();
  next();
});

// Mount the single router (routes.js contains all endpoints)
app.use("/", routes);

// simple health-check
app.get("/", (req, res) =>
  res.json({ status: "ok", timestamp: req.requestTimestamp })
);

// start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment (set in .env)");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
