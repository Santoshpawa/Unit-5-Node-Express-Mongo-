const express = require("express");
const router = express.Router();
const { Customer, Order } = require("./models");

// 1. Total amount spent by each customer
router.get("/total-spent", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$customerId", totalSpent: { $sum: "$amount" } } },
  ]);
  res.json(result);
});

// 2. Order details with customer info
router.get("/orders-with-customers", async (req, res) => {
  const result = await Order.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
  ]);
  res.json(result);
});

// 3. Orders > 500
router.get("/orders-gt-500", async (req, res) => {
  const result = await Order.find({ amount: { $gt: 500 } });
  res.json(result);
});

// 4. Average order amount per customer
router.get("/avg-per-customer", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$customerId", avgAmount: { $avg: "$amount" } } },
  ]);
  res.json(result);
});

// 5. Orders with customer details, only if customer exists
router.get("/orders-with-valid-customers", async (req, res) => {
  const result = await Order.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    { $match: { customerInfo: { $ne: [] } } },
  ]);
  res.json(result);
});

module.exports = router;
