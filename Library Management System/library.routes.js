const express = require("express");
const router = express.Router();
const Library = require("./library.model");

// Middleware: Check for required fields
const validateBookData = (req, res, next) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "Incomplete Data" });
  }
  next();
};

// Middleware: Check if user has borrowed < 3 books
const checkBorrowLimit = async (req, res, next) => {
  const { borrowerName } = req.body;
  const borrowedBooks = await Library.find({
    borrowerName,
    status: "borrowed",
  });
  if (borrowedBooks.length >= 3) {
    return res
      .status(409)
      .json({ error: "Borrow limit exceeded. Maximum 3 books allowed." });
  }
  next();
};

// Add a new book
router.post("/library/books", validateBookData, async (req, res) => {
  try {
    const book = new Library(req.body);
    await book.save();
    res.status(201).json({ message: "Book added", book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrow a book
router.patch("/library/borrow/:id", checkBorrowLimit, async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.status !== "available") {
      return res
        .status(409)
        .json({ error: "Book is not available for borrowing" });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    book.status = "borrowed";
    book.borrowerName = req.body.borrowerName;
    book.borrowDate = borrowDate;
    book.dueDate = dueDate;
    await book.save();

    res.status(200).json({ message: "Book borrowed successfully", book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return a book
router.patch("/library/return/:id", async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.status !== "borrowed") {
      return res.status(409).json({ error: "Book is not currently borrowed" });
    }

    const returnDate = new Date();
    let overdueFees = 0;
    if (book.dueDate && returnDate > book.dueDate) {
      const daysLate = Math.ceil(
        (returnDate - book.dueDate) / (1000 * 60 * 60 * 24)
      );
      overdueFees = daysLate * 10;
    }

    book.status = "available";
    book.returnDate = returnDate;
    book.overdueFees = overdueFees;
    book.borrowerName = null;
    book.borrowDate = null;
    book.dueDate = null;

    await book.save();
    res.status(200).json({ message: "Book returned", overdueFees, book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books (optional filtering by title/status)
router.get("/library/books", async (req, res) => {
  try {
    const { title, status } = req.query;
    const filter = {};
    if (title) filter.title = new RegExp(title, "i");
    if (status) filter.status = status;
    const books = await Library.find(filter);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a book
router.delete("/library/books/:id", async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.status === "borrowed") {
      return res.status(409).json({ error: "Cannot delete a borrowed book" });
    }
    await Library.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
