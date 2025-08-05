const express = require("express");
const mongoose = require("mongoose");
const libraryRoutes = require("./library.routes");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/LibraryDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/", libraryRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
