const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory dishes data
let dishes = [
  { id: 1, name: "Idli", price: 50, category: "breakfast" },
  { id: 2, name: "Dosa", price: 70, category: "breakfast" },
  { id: 3, name: "Thali", price: 120, category: "lunch" },
];

// Route: POST /dishes — Add a new dish
app.post("/dishes", (req, res) => {
  const dish = req.body;
  dishes.push(dish);
  res.status(201).json({ message: "Dish added", dish });
});

// Route: GET /dishes — Get all dishes
app.get("/dishes", (req, res) => {
  res.json(dishes);
});

// Route: GET /dishes/:id — Get a dish by ID
app.get("/dishes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const dish = dishes.find((d) => d.id === id);
  if (dish) res.json(dish);
  else res.status(404).json({ message: "No dish found" });
});

// Route: PUT /dishes/:id — Update a dish by ID
app.put("/dishes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = dishes.findIndex((d) => d.id === id);
  if (index !== -1) {
    dishes[index] = { ...dishes[index], ...req.body };
    res.json({ message: "Dish updated", dish: dishes[index] });
  } else {
    res.status(404).json({ message: "No dish found" });
  }
});

// Route: DELETE /dishes/:id — Delete a dish by ID
app.delete("/dishes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = dishes.length;
  dishes = dishes.filter((d) => d.id !== id);
  if (dishes.length < initialLength) {
    res.json({ message: "Dish deleted" });
  } else {
    res.status(404).json({ message: "No dish found" });
  }
});

// Route: GET /dishes/search?name= — Search by name (partial match)
app.get("/dishes/search", (req, res) => {
  const nameQuery = req.query.name?.toLowerCase();
  if (!nameQuery) {
    return res.status(400).json({ message: "Missing search parameter" });
  }

  const results = dishes.filter((d) =>
    d.name.toLowerCase().includes(nameQuery)
  );

  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ message: "No dish found" });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
