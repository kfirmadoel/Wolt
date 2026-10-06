// models/restaurantModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
    id: {
        type: String,
        unique: true
    },
    ownerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true
    },
    isPromoted: {
        type: Boolean,
        default: false
    },
    picture: {
        type: String,
        required: true
    },
    location: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);