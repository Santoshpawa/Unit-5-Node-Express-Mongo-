// db.js
const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  saleId: Number,
  product: String,
  category: String,
  amount: Number,
  date: Date,
  region: String,
});

const Sale = mongoose.model("Sale", salesSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Connection Failed", err);
    process.exit(1);
  }
};

module.exports = { connectDB, Sale };
