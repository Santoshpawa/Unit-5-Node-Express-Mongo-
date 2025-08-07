const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, "Name must be at least 3 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    }
});

module.exports = mongoose.model('User', userSchema);
