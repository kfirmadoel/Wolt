// src/web/controllers/restaurantsController.js
const restaurantModel = require('../services/restaurantService');

const RESTAURANT_CATEGORIES = [
    'Burgers', 
    'Pizza', 
    'Sushi', 
    'Asian', 
    'Bakery',
    'Salads', 
    'Desserts', 
    'Mexican', 
    'Drinks', 
    'Grocery'
];

const validateRestaurant = (data, partial = false) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return "Request body must be an object";
    }
    if ((!partial || data.name !== undefined) && (typeof data.name !== 'string' || !data.name.trim())) {
        return "Name is required";
    }
    if (data.description !== undefined && typeof data.description !== 'string') {
        return "Description must be a string";
    }
    if (data.address !== undefined && typeof data.address !== 'string') {
        return "Address must be a string";
    }
    if (data.phone !== undefined && (typeof data.phone !== 'string' || (data.phone !== '' && !/^\d+$/.test(data.phone)))) {
        return "Phone number must contain digits only";
    }
    if ((!partial || data.category !== undefined) && !RESTAURANT_CATEGORIES.includes(data.category)) {
        return "Choose a category from the available categories";
    }
    if ((!partial || data.picture !== undefined) &&
        (typeof data.picture !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(data.picture))) {
        return "A PNG, JPEG, or WebP restaurant image is required";
    }
    if ((!partial || data.isPromoted !== undefined) && typeof data.isPromoted !== 'boolean') {
        return "Choose whether the restaurant is promoted";
    }
    if (!partial || data.location !== undefined) {
        if (!data.location || typeof data.location !== 'object' || Array.isArray(data.location) ||
            !Number.isFinite(data.location.x) || !Number.isFinite(data.location.y) ||
            data.location.x < -90 || data.location.x > 90 || data.location.y < -180 || data.location.y > 180) {
            return "Location must contain valid latitude and longitude coordinates";
        }
    }
    return null;
};

const getRestaurantCategories = (req, res) => {
    res.status(200).json(RESTAURANT_CATEGORIES);
};

const getAllRestaurants = async (req, res) => {
    res.status(200).json(await restaurantModel.getAll());
};

const getOwnedRestaurants = async (req, res) => {
    res.status(200).json(await restaurantModel.getByOwner(req.userId));
};

const createRestaurant = async (req, res) => {
    const error = validateRestaurant(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const newRestaurant = await restaurantModel.create(req.body, req.userId);
    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).send();
};

const getRestaurantById = async (req, res) => {
    const restaurant = await restaurantModel.getById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
};

const updateRestaurant = async (req, res) => {
    const error = validateRestaurant(req.body, true);
    if (error) {
        return res.status(400).json({ error });
    }

    const updatedRestaurant = await restaurantModel.update(req.params.id, req.body);
    if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(204).send();
};

const deleteRestaurant = async (req, res) => {
    const success = await restaurantModel.deleteRestaurant(req.params.id);
    if (!success) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(204).send();
};

module.exports = {
    getRestaurantCategories,
    getAllRestaurants,
    getOwnedRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};
