const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// Route 1: Add User
router.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route 2: Add Profile
router.post("/add-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileName, url } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles.push({ profileName, url });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route 3: Get Users (+ optional profile filter)
router.get("/get-users", async (req, res) => {
  try {
    const { profile } = req.query;
    let users = await User.find();

    if (profile) {
      users = users.filter((user) =>
        user.profiles.some((p) => p.profileName === profile)
      );
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 4: Search user and profile
router.get("/search", async (req, res) => {
  const { name, profile } = req.query;

  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const foundProfile = user.profiles.find((p) => p.profileName === profile);
    if (foundProfile) {
      return res.json({ user: user.name, profile: foundProfile });
    } else {
      return res.json({
        message: "User found, but profile not found",
        user,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 5: Update Profile
router.put("/update-profile/:userId/:profileName", async (req, res) => {
  const { userId, profileName } = req.params;
  const { url } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = user.profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.url = url;
    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route 6: Delete Profile
router.delete("/delete-profile/:userId/:profileName", async (req, res) => {
  const { userId, profileName } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles = user.profiles.filter((p) => p.profileName !== profileName);
    await user.save();

    res.json({ message: "Profile deleted", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
