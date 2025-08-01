const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

// ===== Middleware =====
const loggerMiddleware = (req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  }\n`;
  fs.appendFileSync("requests.log", log);
  next();
};

const returnCheckMiddleware = (req, res, next) => {
  const books = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });

  const borrowedDate = new Date(book.borrowedDate);
  const now = new Date();
  const diffDays = Math.floor((now - borrowedDate) / (1000 * 60 * 60 * 24));

  if (diffDays < 3) {
    return res
      .status(400)
      .json({ error: "Book cannot be returned within 3 days of borrowing." });
  }
  next();
};

const transactionLogger = (message) => {
  const log = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync("transactions.log", log);
};

// ===== Utility Functions =====
const loadBooks = () => JSON.parse(fs.readFileSync("db.json", "utf-8"));
const saveBooks = (data) =>
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

// ===== Admin Routes =====
app.use(loggerMiddleware);

app.post("/admin/books", (req, res) => {
  const books = loadBooks();
  const book = { ...req.body, id: Date.now(), status: "available" };
  books.push(book);
  saveBooks(books);
  res.status(201).json(book);
});

app.get("/admin/books", (req, res) => {
  const books = loadBooks();
  res.json(books);
});

app.patch("/admin/books/:id", (req, res) => {
  const books = loadBooks();
  const index = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  books[index] = { ...books[index], ...req.body };
  saveBooks(books);
  res.json(books[index]);
});

app.delete("/admin/books/:id", (req, res) => {
  let books = loadBooks();
  const index = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  const deleted = books.splice(index, 1)[0];
  saveBooks(books);
  res.json({ message: "Book deleted", book: deleted });
});

// ===== Reader Routes =====
app.get("/reader/books", (req, res) => {
  const books = loadBooks();
  const availableBooks = books.filter((b) => b.status === "available");
  res.json(availableBooks);
});

app.post("/reader/borrow/:id", (req, res) => {
  const books = loadBooks();
  const index = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  const book = books[index];
  if (book.status !== "available")
    return res.status(400).json({ error: "Book is already borrowed" });

  const { readerName } = req.body;
  if (!readerName)
    return res.status(400).json({ error: "Reader name is required" });

  book.status = "borrowed";
  book.borrowedBy = readerName;
  book.borrowedDate = new Date().toISOString().split("T")[0];

  saveBooks(books);
  transactionLogger(`${readerName} borrowed "${book.title}"`);
  res.json(book);
});

app.post("/reader/return/:id", returnCheckMiddleware, (req, res) => {
  const books = loadBooks();
  const index = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  const book = books[index];
  const readerName = book.borrowedBy;

  book.status = "available";
  delete book.borrowedBy;
  delete book.borrowedDate;

  saveBooks(books);
  transactionLogger(`${readerName} returned "${book.title}"`);
  res.json({ message: "Book returned successfully", book });
});

// ===== 404 Fallback =====
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ===== Start Server =====
app.listen(3000, () => console.log("Server running on port 3000"));
