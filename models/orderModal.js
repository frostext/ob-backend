const mongoose = require('mongoose');

// Define the order schema
const orderSchema = new mongoose.Schema({
    orderNumber : {
        type: String,
        required: true,
        default: Math.floor(100000 + Math.random() * 900000).toString(),
    },

    cart: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            category:{
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
    orderedDate:{
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
});

// Create the order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
