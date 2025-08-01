const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const readEmployees = () =>
  JSON.parse(fs.readFileSync("employees.json", "utf-8"));
const writeEmployees = (data) =>
  fs.writeFileSync("employees.json", JSON.stringify(data, null, 2));

// Logger Middleware
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} | ${req.method} ${req.url}`;
  console.log(log);
  next();
});

// Role Check Middleware
function authorize(roles = []) {
  return (req, res, next) => {
    const role = req.headers["x-role"];
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }
    next();
  };
}

// GET all employees (admin & hr)
app.get("/employees", authorize(["admin", "hr"]), (req, res) => {
  const data = readEmployees();
  res.json(data);
});

// POST new employee (admin only)
app.post("/employees", authorize(["admin"]), (req, res) => {
  const data = readEmployees();
  const newEmp = { id: Date.now(), ...req.body };
  data.push(newEmp);
  writeEmployees(data);
  res.status(201).json(newEmp);
});

// PUT update employee (admin & hr)
app.put("/employees/:id", authorize(["admin", "hr"]), (req, res) => {
  const data = readEmployees();
  const id = parseInt(req.params.id);
  const index = data.findIndex((emp) => emp.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Employee not found" });

  data[index] = { ...data[index], ...req.body };
  writeEmployees(data);
  res.json(data[index]);
});

// DELETE employee (admin only)
app.delete("/employees/:id", authorize(["admin"]), (req, res) => {
  const data = readEmployees();
  const id = parseInt(req.params.id);
  const index = data.findIndex((emp) => emp.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Employee not found" });

  const removed = data.splice(index, 1)[0];
  writeEmployees(data);
  res.json({ message: "Employee deleted", employee: removed });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000, () =>
  console.log("Employee Management App running on port 3000")
);
