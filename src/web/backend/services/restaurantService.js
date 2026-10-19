// services/restaurantService.js
const Restaurant = require('../models/restaurantModel');

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
        name: data.name,
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
    const { name, description, address, phone, category, isPromoted, picture, location } = data;
    return await Restaurant.findOneAndUpdate(
        { id },
        { name, description, address, phone, category, isPromoted, picture, location },
        { new: true, runValidators: true, omitUndefined: true }
    );
};

const deleteRestaurant = async (id) => {
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