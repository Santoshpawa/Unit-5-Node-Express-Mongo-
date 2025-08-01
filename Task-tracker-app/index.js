const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const readTasks = () => JSON.parse(fs.readFileSync("tasks.json", "utf-8"));
const writeTasks = (tasks) =>
  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

// Get all tasks
app.get("/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// Filter tasks by tag
app.get("/tasks/filter", (req, res) => {
  const tag = req.query.tag;
  const tasks = readTasks();
  const filtered = tasks.filter((task) => task.tag === tag);
  res.json(filtered);
});

// Add a task
app.post("/tasks", (req, res) => {
  const tasks = readTasks();
  const newTask = { id: Date.now(), ...req.body };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// Update a task
app.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  tasks[index] = { ...tasks[index], ...req.body };
  writeTasks(tasks);
  res.json(tasks[index]);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const removed = tasks.splice(index, 1)[0];
  writeTasks(tasks);
  res.json({ message: "Task deleted", task: removed });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(3000, () => console.log("Task Tracker app running on port 3000"));
