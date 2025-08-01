const express = require("express");
const app = express();
const PORT = 3000;

// Dummy user data
const singleUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
};

const userList = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Doe", email: "jane@example.com" },
  { id: 3, name: "Bob Smith", email: "bob@example.com" },
];

// Route: GET /users/get
app.get("/user", (req, res) => {
  res.json(singleUser);
});

// Route: GET /users/list
app.get("/", (req, res) => {
  res.json(userList);
});

// Handle undefined routes (404)
app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
