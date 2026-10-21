const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    id: { 
        type: String, 
        unique: true 
    },
    username: { 
        type: String, 
        required: true, unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true, 
        enum: ['customer', 'restaurant_owner'] },
    name: { 
        type: String 
    },
    phone: { 
        type: String 
    },
    address: { 
        type: String 
    },
    picture: { 
        type: String 
    },
    location: {
        x: { 
            type: Number, 
            required: true },
        y: { 
            type: Number, 
            required: true }
    }
});

module.exports = mongoose.model('User', User);