const express = require("express");
const app = express();
const PORT = 3000;

// Route: GET /
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Home Page</h1>");
});

// Route: GET /aboutus
app.get("/aboutus", (req, res) => {
  res.json({ message: "Welcome to About Us" });
});

// Route: GET /contactus
app.get("/contactus", (req, res) => {
  res.json({
    email: "contact@example.com",
    phone: "+91-1234567890",
    address: "123 Express Street, Node City",
  });
});

// Handle undefined routes (404)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
