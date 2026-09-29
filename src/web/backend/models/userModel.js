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
        address: data.address || "",
        picture: data.picture || "",
        location: { x: data.location.x, y: data.location.y }
    };
    db.addUser(newUser);
    return newUser;
};

const getById = (id) => {
    const user = db.getUserById(id);
    if (!user) return null;
    // Exclude sensitive fields but include location so the frontend can compute distances
    const { password, ...safeUser } = user;
    return safeUser;
};

const authenticate = (username, password) => {
    return db.getUsers().find(u => u.username === username && u.password === password);
};

/**
 * Update the geolocation coordinates of a user.
 * @param {string} id - The user's ID.
 * @param {{ x: number, y: number }} location - The new coordinates.
 * @returns {object|null} The updated safe user object, or null if not found.
 */
const updateLocation = (id, location) => {
    const user = db.getUserById(id);
    if (!user) return null;
    user.location = { x: location.x, y: location.y };
    const { password, ...safeUser } = user;
    return safeUser;
};

module.exports = {
    create,
    getById,
    authenticate,
    updateLocation
};
