// src/web/controllers/usersController.js
const userModel = require('../models/userModel');
const jwtService = require('../services/jwtService');

const createUser = (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    

    if (!req.body.role || (req.body.role !== "customer" && req.body.role !== "restaurant_owner")) {
        return res.status(400).json({ error: "Role must be either 'customer' or 'restaurant_owner'" });
    }

    const newUser = userModel.create(req.body);
    if (!newUser){
        return res.status(409).json({ error: "Username is already taken" });
    }
    
    res.status(201).json({ message: "User created successfully", id: newUser.id });
};

const getUser = (req, res) => {
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

module.exports = {
    createUser,
    getUser,
    loginUser
};