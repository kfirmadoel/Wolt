// src/web/controllers/usersController.js
const userService = require('../services/userService');
const jwtService = require('../services/jwtService');

const createUser = async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: "Request body must be an object" });
    }
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

    const newUser = await userService.create({ ...req.body, username: username.trim(), name: name.trim() });
    if (!newUser) {
        return res.status(409).json({ error: "Username is already taken" });
    }

    res.status(201).json({ message: "User created successfully", id: newUser.id });
};

const getUser = async (req, res) => {
    if (req.params.id !== req.userId) {
        return res.status(403).json({ error: "You can only view your own profile" });
    }

    const user = await userService.getById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
};

const loginUser = async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: "Request body must be an object" });
    }
    const { username, password } = req.body;

    // typeof checks block NoSQL injection such as {"username": {"$ne": null}}
    if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await userService.authenticate(username.trim(), password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwtService.signToken(user);
    res.status(200).json({ token, id: user.id });
};

const updateUserLocation = async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: "Request body must be an object" });
    }
    const { location } = req.body;

    if (!location || typeof location !== 'object' || Array.isArray(location) ||
        !Number.isFinite(location.x) || !Number.isFinite(location.y) ||
        location.x < -90 || location.x > 90 || location.y < -180 || location.y > 180) {
        return res.status(400).json({ error: "Location must contain numeric x and y coordinates" });
    }

    if (req.params.id !== req.userId) {
        return res.status(403).json({ error: "You can only update your own location" });
    }

    const updated = await userService.updateLocation(req.params.id, location);
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
