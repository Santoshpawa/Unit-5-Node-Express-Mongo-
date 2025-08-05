const express = require("express");
const router = express.Router();
const limitedRateLimiter = require("../middleware/rateLimiter");

// Public route (no rate limit)
router.get("/public", (req, res) => {
  res.json({ message: "This is a public endpoint!" });
});

// Limited route (rate limit applied)
router.get("/limited", limitedRateLimiter, (req, res) => {
  res.json({ message: "You have access to this limited endpoint!" });
});

module.exports = router;
