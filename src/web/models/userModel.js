// src/web/models/userModel.js
const db = require('../database');

const create = (data) => {
    const existingUser = db.getUsers().find(u => u.username === data.username);
    if (existingUser) return null;

    const newId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = {
        id: newId,
        username: data.username,
        password: data.password,
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || ""
    };
    db.addUser(newUser);
    return newUser;
};

const getById = (id) => {
    return db.getUserById(id);
};

const authenticate = (username, password) => {
    return db.getUsers().find(u => u.username === username && u.password === password);
};

module.exports = {
    create,
    getById,
    authenticate
};