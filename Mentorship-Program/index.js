require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRouter = require("./routes");

const app = express();
app.use(express.json());

// Mount the API router under /api
app.use("/api", apiRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set in .env");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start", err.message);
    process.exit(1);
  }
}

start();
