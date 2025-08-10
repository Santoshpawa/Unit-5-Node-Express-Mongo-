require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes");

const app = express();
app.use(express.json());

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }
})();
