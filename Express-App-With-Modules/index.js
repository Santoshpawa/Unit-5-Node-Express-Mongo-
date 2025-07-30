// index.js

const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const PORT = 3000;

// Route 1: GET /
app.get("/", (req, res) => {
  res.send("Welcome to home page");
});

// Route 2: GET /readfile
app.get("/readfile", (req, res) => {
  const filePath = path.join(__dirname, "data.txt");

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("data.txt file not found");
  }

  const content = fs.readFileSync(filePath, "utf-8");
  res.send(content);
});

// Route 3: GET /systeminfo
app.get("/systeminfo", (req, res) => {
  res.json({
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
    hostname: os.hostname(),
  });
});

// Route 4: GET /greet?name=YourName
app.get("/greet", (req, res) => {
  const { name } = req.query;
  if (!name) return res.send("Please provide a name");
  res.send(`Hello ${name}, welcome to server`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
