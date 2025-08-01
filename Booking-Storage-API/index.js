const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory book storage
let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", year: 1988 },
  { id: 2, title: "1984", author: "George Orwell", year: 1949 },
  { id: 3, title: "Brida", author: "Paulo Coelho", year: 1990 },
];

// Route: POST /books - Add a new book
app.post("/books", (req, res) => {
  const book = req.body;
  books.push(book);
  res.status(201).json({ message: "Book added", book });
});

// Route: GET /books - Get all books
app.get("/books", (req, res) => {
  res.json(books);
});

// Route: GET /books/:id - Get book by ID
app.get("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find((b) => b.id === id);
  if (book) res.json(book);
  else res.status(404).json({ message: "No book found" });
});

// Route: PUT /books/:id - Update a book by ID
app.put("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex((b) => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...req.body };
    res.json({ message: "Book updated", book: books[index] });
  } else {
    res.status(404).json({ message: "No book found" });
  }
});

// Route: DELETE /books/:id - Delete a book by ID
app.delete("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = books.length;
  books = books.filter((b) => b.id !== id);
  if (books.length < initialLength) {
    res.json({ message: "Book deleted" });
  } else {
    res.status(404).json({ message: "No book found" });
  }
});

// Route: GET /books/search?author= - Search by author (case-insensitive, partial match)
app.get("/books/search", (req, res) => {
  const authorQuery = req.query.author?.toLowerCase();
  if (!authorQuery) {
    return res.status(400).json({ message: "Missing author parameter" });
  }

  const results = books.filter((b) =>
    b.author.toLowerCase().includes(authorQuery)
  );

  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ message: "No book found" });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
