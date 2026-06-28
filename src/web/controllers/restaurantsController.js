// src/web/controllers/restaurantsController.js
const db = require('../database');

module.exports = {
    getAllRestaurants: (req, res) => {
        res.status(200).json(db.getRestaurants());
    },

    createRestaurant: (req, res) => {
        const { name, address, phone } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const newId = 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        const newRestaurant = {
            id: newId,
            name,
            address: address || "",
            phone: phone || "",
            menu: [] 
        };

        db.addRestaurant(newRestaurant);
        
        // Return 201 with Location header and no body, exactly as required in the appendix
        res.location(`/api/restaurants/${newId}`);
        res.status(201).send();
    },

    getRestaurantById: (req, res) => {
        const restaurant = db.getRestaurantById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.status(200).json(restaurant);
    },

    updateRestaurant: (req, res) => {
        const restaurant = db.getRestaurantById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        if (req.body.name) restaurant.name = req.body.name;
        if (req.body.address) restaurant.address = req.body.address;
        if (req.body.phone) restaurant.phone = req.body.phone;

        res.status(204).send(); 
    },

    deleteRestaurant: (req, res) => {
        const success = db.deleteRestaurant(req.params.id);
        if (!success) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.status(204).send(); 
    }
};