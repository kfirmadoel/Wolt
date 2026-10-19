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
    if (!req.body.name) {
        return res.status(400).json({ error: "Name is required" });
    }
    if (req.body.phone !== undefined && req.body.phone !== "" &&
        (typeof req.body.phone !== "string" || !/^\d+$/.test(req.body.phone))) {
        return res.status(400).json({ error: "Phone number must contain digits only" });
    }
    if (!req.body.location || typeof req.body.location.x !== "number" || typeof req.body.location.y !== "number") {
        return res.status(400).json({ error: "Location with numeric x and y is required" });
    }
    if (req.body.location.x < -90 || req.body.location.x > 90 || req.body.location.y < -180 || req.body.location.y > 180) {
        return res.status(400).json({ error: "Location coordinates are out of range" });
    }
    if (req.body.category !== undefined && typeof req.body.category !== "string") {
        return res.status(400).json({ error: "Category must be a string" });
    }
    if (!RESTAURANT_CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({ error: "Choose a category from the available categories" });
    }
    if (typeof req.body.picture !== "string" || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(req.body.picture)) {
        return res.status(400).json({ error: "A PNG, JPEG, or WebP restaurant image is required" });
    }
    if (typeof req.body.isPromoted !== "boolean") {
        return res.status(400).json({ error: "Choose whether the restaurant is promoted" });
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
    if (req.body.name !== undefined && req.body.name.trim() === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
    }
    if (req.body.category !== undefined && typeof req.body.category !== "string") {
        return res.status(400).json({ error: "Category must be a string" });
    }
    if (req.body.isPromoted !== undefined && typeof req.body.isPromoted !== "boolean") {
        return res.status(400).json({ error: "isPromoted must be a boolean" });
    }
    if (req.body.picture !== undefined && (typeof req.body.picture !== "string" || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(req.body.picture))) {
        return res.status(400).json({ error: "Restaurant image must be a PNG, JPEG, or WebP image" });
    }
    if (req.body.location !== undefined && (!req.body.location ||
        typeof req.body.location.x !== "number" || typeof req.body.location.y !== "number" ||
        req.body.location.x < -90 || req.body.location.x > 90 ||
        req.body.location.y < -180 || req.body.location.y > 180)) {
        return res.status(400).json({ error: "Location must contain valid latitude and longitude coordinates" });
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