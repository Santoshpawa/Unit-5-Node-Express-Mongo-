const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

// ---------- Utilities ----------
const DB_PATH = "./db.json";

function readTodos() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw).todos;
}

function writeTodos(todos) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ todos }, null, 2));
}

// ---------- Routes ----------

// Get all todos
app.get("/todos", (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// Get todo by ID
app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todo = readTodos().find((t) => t.id === id);
  todo ? res.json(todo) : res.status(404).json({ message: "No task found" });
});

// Add a new todo
app.post("/todos", (req, res) => {
  const todos = readTodos();
  const newTodo = req.body;
  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json({ message: "Task added", todo: newTodo });
});

// Update a todo
app.put("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let todos = readTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body };
    writeTodos(todos);
    res.json({ message: "Task updated", todo: todos[index] });
  } else {
    res.status(404).json({ message: "No task found" });
  }
});

// Delete a todo
app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let todos = readTodos();
  const updatedTodos = todos.filter((t) => t.id !== id);
  if (updatedTodos.length < todos.length) {
    writeTodos(updatedTodos);
    res.json({ message: "Task deleted" });
  } else {
    res.status(404).json({ message: "No task found" });
  }
});

// Partial search
app.get("/todos/search/task", (req, res) => {
  const query = req.query.task?.toLowerCase();
  if (!query) return res.status(400).json({ message: "Missing query" });

  const results = readTodos().filter((t) =>
    t.task.toLowerCase().includes(query)
  );
  results.length
    ? res.json(results)
    : res.status(404).json({ message: "No task found" });
});

// Handle invalid route
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
