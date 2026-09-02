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
        role: data.role,
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || ""
    };
    db.addUser(newUser);
    return newUser;
};

const getById = (id) => {
    const user = db.getUserById(id);
    if (!user) return null;
    const { password, phone, address, role, ...safeUser } = user;
    return safeUser;
};

const authenticate = (username, password) => {
    return db.getUsers().find(u => u.username === username && u.password === password);
};

module.exports = {
    create,
    getById,
    authenticate
};