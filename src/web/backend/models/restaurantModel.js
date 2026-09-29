// models/restaurantModel.js
const db = require('../database');

const getAll = () => db.getRestaurants();

const getByOwner = (ownerId) => db.getRestaurants().filter((restaurant) => restaurant.ownerId === ownerId);

const getById = (id) => db.getRestaurantById(id);

const create = (data,ownerId) => {
    const restaurant = {
        // That will promise unique id for everyone
        id: 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        ownerId,
        name: data.name,
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        category: typeof data.category === 'string' ? data.category.trim() : "",
        isPromoted: data.isPromoted === true,
        picture: data.picture,
        location: {
            x: data.location.x,
            y: data.location.y
        }
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
    if (data.category !== undefined) {
        restaurant.category = data.category.trim();
    }
    if (data.isPromoted !== undefined) {
        restaurant.isPromoted = data.isPromoted;
    }
    if (data.picture !== undefined) {
        restaurant.picture = data.picture;
    }
    if (data.location !== undefined) {
        restaurant.location = { x: data.location.x, y: data.location.y };
    }
    
    return restaurant;
};

const deleteRestaurant = (id) => {
    db.getProductsByRestaurantId(id).forEach((product) => db.deleteProduct(product.id));
    return db.deleteRestaurant(id);
};

module.exports = {
    getAll,
    getByOwner,
    getById,
    create,
    update,
    deleteRestaurant
};