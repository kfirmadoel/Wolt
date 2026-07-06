// src/web/controllers/usersController.js
const userModel = require('../models/userModel');

const createUser = (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
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
    
    res.status(200).json({ id: user.id });
};

module.exports = {
    createUser,
    getUser,
    loginUser
};