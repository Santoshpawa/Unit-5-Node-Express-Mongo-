const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  _id: String,
  name: String,
  city: String,
});

const orderSchema = new mongoose.Schema({
  _id: Number,
  customerId: { type: String, ref: "Customer" },
  amount: Number,
  product: String,
});

const Customer = mongoose.model("Customer", customerSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = { Customer, Order };
