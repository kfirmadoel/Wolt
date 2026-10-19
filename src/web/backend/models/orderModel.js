// models/orderModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({
    id: { 
        type: String, 
        unique: true 
    },
    userId: { 
        type: String, 
        required: true 
    },
    restaurantId: { 
        type: String, 
        required: true 
    },
    restaurantName: {
        type: String,
        default: ""
    },
    items: [{
        productId: { 
            type: String, 
            required: true 
        },
        name: { type: String, default: "" },
        description: { type: String, default: "" },
        picture: { type: String, default: "" },
        category: { type: String, default: "" },
        price: { type: Number, min: 0 },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: 'Quantity must be a positive integer'
            }
        }
    }],
    totalPrice: { 
        type: Number, 
        required: true,
        min: 0
    },
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Order', Order);
