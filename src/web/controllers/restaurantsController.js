// src/web/controllers/restaurantsController.js
const restaurantModel = require('../models/restaurantModel');

const getAllRestaurants = (req, res) => {
    res.status(200).json(restaurantModel.getAll());
};

const createRestaurant = (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const newRestaurant = restaurantModel.create(req.body);
    
    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).send();
};

const getRestaurantById = (req, res) => {
    const restaurant = restaurantModel.getById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
};

const updateRestaurant = (req, res) => {
    if (req.body.name !== undefined && req.body.name.trim() === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
    }
    const updatedRestaurant = restaurantModel.update(req.params.id, req.body);
    
    if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(204).send(); 
};

const deleteRestaurant = (req, res) => {
    const success = restaurantModel.deleteRestaurant(req.params.id);
    if (!success) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(204).send(); 
};

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
}