const express = require("express");
const router = express.Router();
const Order = require("./models");

// 1. Top 3 best-selling products by quantity sold
router.get("/top-products", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$productName", totalQuantity: { $sum: "$quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 3 },
  ]);
  res.json(result);
});

// 2. Total revenue for each product category
router.get("/revenue-by-category", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$category", totalRevenue: { $sum: "$totalPrice" } } },
  ]);
  res.json(result);
});

// 3. Average total price of all orders
router.get("/average-order-price", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: null, avgPrice: { $avg: "$totalPrice" } } },
  ]);
  res.json(result);
});

// 4. Number of orders placed each month
router.get("/orders-per-month", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: { $month: "$orderDate" }, orderCount: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(result);
});

// 5. Percentage of canceled orders
router.get("/cancel-percentage", async (req, res) => {
  const total = await Order.countDocuments();
  const canceled = await Order.countDocuments({ status: "Cancelled" });
  const percentage = (canceled / total) * 100;
  res.json({ percentage });
});

// 6. Top product category by revenue
router.get("/top-category-revenue", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$category", revenue: { $sum: "$totalPrice" } } },
    { $sort: { revenue: -1 } },
    { $limit: 1 },
  ]);
  res.json(result);
});

// 7. Most frequently ordered product
router.get("/most-frequent-product", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$productName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  res.json(result);
});

// 8. Monthly revenue trend
router.get("/monthly-revenue", async (req, res) => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$orderDate" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(result);
});

// 9. Count of orders by status
router.get("/status-count", async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json(result);
});

// 10. Total number of orders and quantity sold
router.get("/total-orders-quantity", async (req, res) => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);
  res.json(result);
});

module.exports = router;
