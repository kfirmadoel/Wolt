// services/searchService.js
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

const search = async (query) => {
    const regex = new RegExp(query, 'i'); // 'i' = case-insensitive

    const restaurants = await Restaurant.find({
        $or: [{ name: regex }, { description: regex }]
    });

    const products = await Product.find({
        $or: [{ name: regex }, { description: regex }]
    });

    return { restaurants, products };
};

module.exports = {
    search
};