const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    username: String,
    productName: String,
    category: String,
    quantity: Number,
    totalPrice: Number,
    orderDate: Date,
    status: String
});

module.exports = mongoose.model('Order', orderSchema);
