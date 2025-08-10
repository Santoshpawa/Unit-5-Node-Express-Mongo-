// index.js
require("dotenv").config();
const { connectDB, Sale } = require("./db");
const agg = require("./aggregations");

const run = async () => {
  await connectDB();

  // Uncomment if you need to insert dataset first:
  /*
  await Sale.insertMany([
    { saleId: 1, product: "Laptop", category: "Electronics", amount: 800, date: new Date("2024-01-10"), region: "North" },
    { saleId: 2, product: "Mobile", category: "Electronics", amount: 500, date: new Date("2024-02-15"), region: "South" },
    { saleId: 3, product: "Shoes", category: "Fashion", amount: 200, date: new Date("2024-01-20"), region: "North" },
    { saleId: 4, product: "TV", category: "Electronics", amount: 1000, date: new Date("2024-03-05"), region: "West" },
    { saleId: 5, product: "T-shirt", category: "Fashion", amount: 50, date: new Date("2024-02-25"), region: "East" },
    { saleId: 6, product: "Headphones", category: "Electronics", amount: 150, date: new Date("2024-04-01"), region: "South" },
    { saleId: 7, product: "Watch", category: "Fashion", amount: 300, date: new Date("2024-03-15"), region: "North" },
    { saleId: 8, product: "Laptop", category: "Electronics", amount: 850, date: new Date("2024-02-12"), region: "West" },
    { saleId: 9, product: "Shoes", category: "Fashion", amount: 250, date: new Date("2024-04-18"), region: "South" }
  ]);
  */

  console.log(
    "1. Total Sales per Category:",
    await agg.totalSalesPerCategory()
  );
  console.log("2. Month-wise Sales:", await agg.monthWiseSales());
  console.log("3. Highest Selling Product:", await agg.highestSellingProduct());
  console.log("4. Average Sale Amount:", await agg.averageSaleAmount());
  console.log("5. Sales Count per Month:", await agg.salesCountPerMonth());
  console.log("6. Total Sales per Region:", await agg.totalSalesPerRegion());
  console.log("7. Top 3 Products:", await agg.top3Products());
  console.log(
    "8. Sales Count per Category:",
    await agg.salesCountPerCategory()
  );
  console.log("9. Avg Sales per Region:", await agg.avgSalesPerRegion());
  console.log(
    "10. Total Sales for Electronics & Fashion:",
    await agg.totalSalesElectronicsFashion()
  );

  process.exit();
};

run();
