// models/productModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    id: { 
        type: String, 
        unique: true 
    },
    restaurantId: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    price: { 
        type: Number, 
        required: true,
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: 'Price must be strictly greater than 0'
        }
    }
});

module.exports = mongoose.model('Product', Product);