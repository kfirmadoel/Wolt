const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../services/mongoService');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');
const restaurants = require('./restaurants.json');

const ownerId = 'user_wolt_demo_owner';
const username = 'wolt_demo_owner';

const readPicture = (filename) => {
    const image = fs.readFileSync(path.join(__dirname, 'images', filename));
    return 'data:image/jpeg;base64,' + image.toString('base64');
};

const loadDemo = async () => {
    // Read every image before writing any records.
    const ownerPicture = readPicture('coffee.jpg');
    const restaurantData = [];
    const productData = [];
    for (const restaurant of restaurants) {
        const { products, ...details } = restaurant;
        restaurantData.push({ ...details, ownerId, picture: readPicture(details.picture) });
        for (const product of products) {
            productData.push({ ...product, restaurantId: restaurant.id, picture: readPicture(product.picture) });
        }
    }

    await connectDB();
    try {
        await User.init();
        await Restaurant.init();
        await Product.init();

        const owner = await User.findOne({ id: ownerId });
        const namedUser = await User.findOne({ username });
        if ((owner && (owner.username !== username || owner.role !== 'restaurant_owner')) ||
            (namedUser && namedUser.id !== ownerId)) {
            throw new Error('The demo owner ID or username is already in use. No records were changed.');
        }

        const password = process.env.DEMO_PASSWORD;
        if (!owner && (typeof password !== 'string' || password.length < 8 ||
            !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
            throw new Error('Set DEMO_PASSWORD to a demo-only password with at least 8 characters, letters and numbers.');
        }

        const missingRestaurants = [];
        const missingProducts = [];
        for (const data of restaurantData) {
            const existing = await Restaurant.findOne({ id: data.id });
            if (existing && existing.ownerId !== ownerId) {
                throw new Error(`Restaurant ID ${data.id} belongs to another owner. No records were changed.`);
            }
            if (!existing) missingRestaurants.push(new Restaurant(data));
        }
        for (const data of productData) {
            const existing = await Product.findOne({ id: data.id });
            if (existing && existing.restaurantId !== data.restaurantId) {
                throw new Error(`Product ID ${data.id} belongs to another restaurant. No records were changed.`);
            }
            if (!existing) missingProducts.push(new Product(data));
        }

        const newOwner = owner ? null : new User({
            id: ownerId,
            username,
            password,
            name: 'Demo Owner',
            role: 'restaurant_owner',
            picture: ownerPicture,
            location: { x: 32.07, y: 34.78 }
        });
        if (newOwner) await newOwner.validate();
        for (const restaurant of missingRestaurants) await restaurant.validate();
        for (const product of missingProducts) await product.validate();

        // Keep existing records, including changes made through either client.
        if (newOwner) await newOwner.save();
        for (const restaurant of missingRestaurants) await restaurant.save();
        for (const product of missingProducts) await product.save();

        console.log(`Demo data: added ${newOwner ? 1 : 0} owner, ${missingRestaurants.length} restaurants and ${missingProducts.length} dishes.`);
        console.log(`Existing records were kept. Demo owner username: ${username}`);
    } finally {
        await mongoose.disconnect();
    }
};

loadDemo().catch((error) => {
    console.error('Could not load demo data:', error.message);
    process.exitCode = 1;
});
