// src/web/controllers/usersController.js
const db = require('../database');

module.exports = {
    createUser: (req, res) => {
        const { username, password, name, phone, address } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const newId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        const newUser = {
            id: newId,
            username,
            password,
            name: name || "",
            phone: phone || "",
            address: address || ""
        };

        db.addUser(newUser);
        res.status(201).json({ message: "User created successfully", id: newId });
    },

    getUser: (req, res) => {
        const user = db.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    },

    loginUser: (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = db.getUsers().find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        res.status(200).json({ id: user.id });
    }
};