// models/restaurantModel.js
const db = require('../database');

const getAll = () => db.getRestaurants();

const getById = (id) => db.getRestaurantById(id);

const create = (data) => {
    const restaurant = {
        // That will promise unique id for everyone
        id: 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: data.name,
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
    };
    db.addRestaurant(restaurant);
    return restaurant;
};

const update = (id, data) => {
    const restaurant = db.getRestaurantById(id);
    if (!restaurant) return null;
    restaurant.name = data.name ?? restaurant.name;
    restaurant.description = data.description ?? restaurant.description; 
    restaurant.address = data.address ?? restaurant.address;
    restaurant.phone = data.phone ?? restaurant.phone;
    
    return restaurant;
};

const deleteRestaurant = (id) => db.deleteRestaurant(id);

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteRestaurant
};