// routes.js
const express = require("express");
const router = express.Router();
const { User, Book } = require("./models");

// Add User
router.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User added", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add Book
router.post("/add-book", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book added", book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rent Book
router.post("/rent-book", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!user || !book)
      return res.status(404).json({ error: "User or book not found" });

    if (!user.rentedBooks.includes(bookId)) user.rentedBooks.push(bookId);
    if (!book.rentedBy.includes(userId)) book.rentedBy.push(userId);

    await user.save();
    await book.save();
    res.json({ message: "Book rented successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Return Book
router.post("/return-book", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    await User.findByIdAndUpdate(userId, { $pull: { rentedBooks: bookId } });
    await Book.findByIdAndUpdate(bookId, { $pull: { rentedBy: userId } });
    res.json({ message: "Book returned successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get User Rentals
router.get("/user-rentals/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("rentedBooks");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Book Renters
router.get("/book-renters/:bookId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId).populate("rentedBy");
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Book
router.put("/update-book/:bookId", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.bookId, req.body, {
      new: true,
    });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book updated", book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Book
router.delete("/delete-book/:bookId", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    await User.updateMany(
      { rentedBooks: book._id },
      { $pull: { rentedBooks: book._id } }
    );
    res.json({ message: "Book deleted and references removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
