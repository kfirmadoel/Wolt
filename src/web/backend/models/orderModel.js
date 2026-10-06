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
    items: [{
        productId: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
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