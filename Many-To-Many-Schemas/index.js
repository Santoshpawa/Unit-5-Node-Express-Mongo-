require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const apiRoutes = require("./routes");

const app = express();
app.use(express.json());

// Mount routes
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
