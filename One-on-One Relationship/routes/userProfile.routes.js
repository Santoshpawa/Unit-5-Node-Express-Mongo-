const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Profile = require('../models/profile.model');

// POST /add-user → Create new user
router.post('/add-user', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = new User({ name, email });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /add-profile → Create profile for a user
router.post('/add-profile', async (req, res) => {
    try {
        const { bio, socialMediaLinks, user } = req.body;

        // Check if user exists
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if profile for user already exists
        const existingProfile = await Profile.findOne({ user });
        if (existingProfile) {
            return res.status(400).json({ message: "Profile for this user already exists" });
        }

        const profile = new Profile({ bio, socialMediaLinks, user });
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /profiles → Get all profiles with populated user data
router.get('/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', 'name email');
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
