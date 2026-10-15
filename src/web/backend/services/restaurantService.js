// services/restaurantService.js
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

const getAll = async () => {
    return await Restaurant.find({});
};

const getByOwner = async (ownerId) => {
    return await Restaurant.find({ ownerId });
};

const getById = async (id) => {
    return await Restaurant.findOne({ id });
};

const create = async (data, ownerId) => {
    const newId = 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const restaurant = new Restaurant({
        id: newId,
        ownerId,
        name: data.name.trim(),
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        category: data.category,
        isPromoted: data.isPromoted,
        picture: data.picture,
        location: {
            x: data.location?.x,
            y: data.location?.y
        }
    });
    await restaurant.save();
    return restaurant;
};

const update = async (id, data) => {
    const update = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.description !== undefined) update.description = data.description;
    if (data.address !== undefined) update.address = data.address;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.category !== undefined) update.category = data.category;
    if (data.isPromoted !== undefined) update.isPromoted = data.isPromoted;
    if (data.picture !== undefined) update.picture = data.picture;
    if (data.location !== undefined) update.location = data.location;
    return await Restaurant.findOneAndUpdate(
        { id },
        update,
        { new: true, runValidators: true }
    );
};

const deleteRestaurant = async (id) => {
    const restaurant = await Restaurant.findOne({ id });
    if (!restaurant) return null;
    await Product.deleteMany({ restaurantId: id });
    return await Restaurant.findOneAndDelete({ id });
};

module.exports = {
    getAll,
    getByOwner,
    getById,
    create,
    update,
    deleteRestaurant
};
