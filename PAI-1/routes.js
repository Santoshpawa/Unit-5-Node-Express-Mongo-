// routes.js
const express = require("express");
const router = express.Router();
const { Publisher, Game } = require("./models");

/* ---------------- Publisher routes ---------------- */

// Create publisher
router.post("/api/publishers", async (req, res) => {
  try {
    const pub = await Publisher.create(req.body);
    res.status(201).json({ data: pub, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all publishers
router.get("/api/publishers", async (req, res) => {
  try {
    const pubs = await Publisher.find();
    res.json({ data: pubs, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get publisher by id
router.get("/api/publishers/:id", async (req, res) => {
  try {
    const pub = await Publisher.findById(req.params.id);
    if (!pub) return res.status(404).json({ error: "Publisher not found" });
    res.json({ data: pub, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update publisher
router.put("/api/publishers/:id", async (req, res) => {
  try {
    const pub = await Publisher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pub) return res.status(404).json({ error: "Publisher not found" });
    res.json({ data: pub, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete publisher
router.delete("/api/publishers/:id", async (req, res) => {
  try {
    const pub = await Publisher.findByIdAndDelete(req.params.id);
    if (!pub) return res.status(404).json({ error: "Publisher not found" });
    // Note: games referencing this publisher remain (they will have dangling ref). Optionally handle cascade.
    res.json({ message: "Publisher deleted", timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all games by publisher
router.get("/api/publishers/:publisherId/games", async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.publisherId);
    if (!publisher)
      return res.status(404).json({ error: "Publisher not found" });
    const games = await Game.find({
      publisher: req.params.publisherId,
    }).populate("publisher", "name location");
    res.json({ data: games, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------------- Game routes ---------------- */

// Create game (publisher id must be provided)
router.post("/api/games", async (req, res) => {
  try {
    const { publisher: publisherId } = req.body;
    if (!publisherId)
      return res
        .status(400)
        .json({ error: "publisher id is required in body" });

    const publisher = await Publisher.findById(publisherId);
    if (!publisher)
      return res.status(400).json({ error: "Invalid publisher id" });

    const game = await Game.create(req.body);
    res.status(201).json({ data: game, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all games (populate publisher name & location)
router.get("/api/games", async (req, res) => {
  try {
    const games = await Game.find().populate("publisher", "name location");
    res.json({ data: games, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single game by id (populated)
router.get("/api/games/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate(
      "publisher",
      "name location"
    );
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json({ data: game, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update game
router.put("/api/games/:id", async (req, res) => {
  try {
    if (req.body.publisher) {
      const publisherExists = await Publisher.findById(req.body.publisher);
      if (!publisherExists)
        return res.status(400).json({ error: "Invalid publisher id" });
    }
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("publisher", "name location");
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json({ data: game, timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete game
router.delete("/api/games/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json({ message: "Game deleted", timestamp: req.requestTimestamp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
