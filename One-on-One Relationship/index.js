const express = require("express");
const mongoose = require("mongoose");
const userProfileRoutes = require("./routes/userProfile.routes");

const app = express();
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/user-profile-one-to-one", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Register routes
app.use("/", userProfileRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
