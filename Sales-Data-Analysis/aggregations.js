// aggregations.js
const { Sale } = require("./db");

// 1. Total sales amount per category
const totalSalesPerCategory = () =>
  Sale.aggregate([
    { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
  ]);

// 2. Month-wise total sales amount
const monthWiseSales = () =>
  Sale.aggregate([
    { $group: { _id: { $month: "$date" }, totalAmount: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);

// 3. Highest-selling product (by revenue)
const highestSellingProduct = () =>
  Sale.aggregate([
    { $group: { _id: "$product", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 1 },
  ]);

// 4. Average sale amount
const averageSaleAmount = () =>
  Sale.aggregate([{ $group: { _id: null, avgAmount: { $avg: "$amount" } } }]);

// 5. Count sales per month
const salesCountPerMonth = () =>
  Sale.aggregate([
    { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
  ]);

// 6. Total sales per region
const totalSalesPerRegion = () =>
  Sale.aggregate([
    { $group: { _id: "$region", totalAmount: { $sum: "$amount" } } },
  ]);

// 7. Top 3 highest revenue products
const top3Products = () =>
  Sale.aggregate([
    { $group: { _id: "$product", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 3 },
  ]);

// 8. Sales transactions per category
const salesCountPerCategory = () =>
  Sale.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);

// 9. Average sales per region
const avgSalesPerRegion = () =>
  Sale.aggregate([
    { $group: { _id: "$region", avgAmount: { $avg: "$amount" } } },
  ]);

// 10. Total sales for Electronics and Fashion separately
const totalSalesElectronicsFashion = () =>
  Sale.aggregate([
    { $match: { category: { $in: ["Electronics", "Fashion"] } } },
    { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
  ]);

module.exports = {
  totalSalesPerCategory,
  monthWiseSales,
  highestSellingProduct,
  averageSaleAmount,
  salesCountPerMonth,
  totalSalesPerRegion,
  top3Products,
  salesCountPerCategory,
  avgSalesPerRegion,
  totalSalesElectronicsFashion,
};
