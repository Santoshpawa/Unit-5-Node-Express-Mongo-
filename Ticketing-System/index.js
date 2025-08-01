const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;
const DB_PATH = "./db.json";

app.use(express.json());

// -------------------- MIDDLEWARE --------------------
function ticketValidationMiddleware(req, res, next) {
  const { title, description, priority, user } = req.body;
  if (!title || !description || !priority || !user) {
    return res.status(400).json({
      message: "Ticket creation failed. Please provide all required fields.",
    });
  }
  next();
}

// -------------------- DB UTILS --------------------
function readTickets() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data).tickets;
}

function writeTickets(tickets) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ tickets }, null, 2));
}

// -------------------- ROUTES --------------------

// GET all tickets
app.get("/tickets", (req, res) => {
  const tickets = readTickets();
  res.json(tickets);
});

// GET ticket by ID
app.get("/tickets/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = readTickets().find((t) => t.id === id);
  if (ticket) res.json(ticket);
  else res.status(404).json({ message: "Ticket not found" });
});

// POST a new ticket
app.post("/tickets", ticketValidationMiddleware, (req, res) => {
  const tickets = readTickets();
  const newTicket = { ...req.body, id: Date.now(), status: "pending" };
  tickets.push(newTicket);
  writeTickets(tickets);
  res.status(201).json({ message: "Ticket created", ticket: newTicket });
});

// PUT update ticket by ID
app.put("/tickets/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let tickets = readTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...req.body };
    writeTickets(tickets);
    res.json({ message: "Ticket updated", ticket: tickets[index] });
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
});

// PATCH resolve a ticket
app.patch("/tickets/:id/resolve", (req, res) => {
  const id = parseInt(req.params.id);
  let tickets = readTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index !== -1) {
    tickets[index].status = "resolved";
    writeTickets(tickets);
    res.json({ message: "Ticket resolved", ticket: tickets[index] });
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
});

// DELETE ticket
app.delete("/tickets/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let tickets = readTickets();
  const filtered = tickets.filter((t) => t.id !== id);
  if (filtered.length < tickets.length) {
    writeTickets(filtered);
    res.json({ message: "Ticket deleted" });
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
