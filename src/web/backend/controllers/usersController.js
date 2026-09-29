// src/web/controllers/usersController.js
const userModel = require('../models/userModel');
const jwtService = require('../services/jwtService');

const createUser = (req, res) => {
    const { username, password, name, picture, role, location } = req.body;

    if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ error: "Password must be at least 8 characters and contain letters and numbers" });
    }

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: "Display name is required" });
    }

    if (typeof picture !== 'string' || !/^data:image\/[\w.+-]+;base64,/.test(picture)) {
        return res.status(400).json({ error: "A profile image is required" });
    }

    if (!role || (role !== "customer" && role !== "restaurant_owner")) {
        return res.status(400).json({ error: "Role must be either 'customer' or 'restaurant_owner'" });
    }

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number' ||
        location.x < -90 || location.x > 90 || location.y < -180 || location.y > 180) {
        return res.status(400).json({ error: "Valid latitude and longitude coordinates are required" });
    }

    const newUser = userModel.create({ ...req.body, username: username.trim(), name: name.trim() });
    if (!newUser){
        return res.status(409).json({ error: "Username is already taken" });
    }

    res.status(201).json({ message: "User created successfully", id: newUser.id });
};

const getUser = (req, res) => {
    if (req.params.id !== req.userId) {
        return res.status(403).json({ error: "You can only view your own profile" });
    }

    const user = userModel.getById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
};

const loginUser = (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const user = userModel.authenticate(req.body.username, req.body.password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwtService.signToken(user);
    res.status(200).json({ token, id: user.id });
};

/**
 * Update the geolocation of the authenticated user.
 * Body must contain: { location: { x: number, y: number } }
 * Only the authenticated user can update their own location.
 */
const updateUserLocation = (req, res) => {
    const { location } = req.body;

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number' ||
        location.x < -90 || location.x > 90 || location.y < -180 || location.y > 180) {
        return res.status(400).json({ error: "Location must contain numeric x and y coordinates" });
    }

    // Users can only update their own location
    if (req.params.id !== req.userId) {
        return res.status(403).json({ error: "You can only update your own location" });
    }

    const updated = userModel.updateLocation(req.params.id, location);
    if (!updated) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Location updated successfully", location: updated.location });
};

module.exports = {
    createUser,
    getUser,
    loginUser,
    updateUserLocation
};
