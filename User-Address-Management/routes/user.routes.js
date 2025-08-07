const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Address = require("../models/address.model");

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add address to a user
router.post("/users/:userId/address", async (req, res) => {
  try {
    const address = new Address(req.body);
    await address.save();
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { addresses: address._id } },
      { new: true }
    );
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user summary
router.get("/users/summary", async (req, res) => {
  try {
    const users = await User.find().populate("addresses");
    const summary = {
      totalUsers: users.length,
      totalAddresses: users.reduce(
        (acc, user) => acc + user.addresses.length,
        0
      ),
      userAddressCounts: users.map((user) => ({
        name: user.name,
        addressCount: user.addresses.length,
      })),
    };
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user with addresses
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("addresses");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific address from a user
router.delete("/users/:userId/address/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressId } },
      { new: true }
    );
    await Address.findByIdAndDelete(addressId);
    res.json({ message: "Address deleted", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
