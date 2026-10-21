// services/searchService.js
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const search = async (query) => {
    const regex = new RegExp(escapeRegex(query), 'i'); 

    const restaurants = await Restaurant.find({
        $or: [{ name: regex }, { description: regex }]
    });

    const products = await Product.find({
        $or: [{ name: regex }, { description: regex }]
    });

    return { restaurants, products };
};

module.exports = { search };