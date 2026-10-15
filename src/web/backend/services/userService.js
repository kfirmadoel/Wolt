// src/web/services/userService.js
const User = require('../models/userModel');

const create = async (data) => {
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) return null;

    const newId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = new User({
        id: newId,
        username: data.username,
        password: data.password,
        role: data.role,
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        picture: data.picture || "",
        location: data.location
    });

    await newUser.save();
    return newUser;
};

const getById = async (id) => {
    const user = await User.findOne({ id });
    if (!user) return null;
    const { password, phone, address, ...safeUser } = user.toObject();
    return safeUser;
};

const authenticate = async (username, password) => {
    return await User.findOne({ username, password });
};

const updateLocation = async (id, location) => {
    const user = await User.findOneAndUpdate({ id }, { location }, { new: true });
    return user;
};

module.exports = {
    create,
    getById,
    authenticate,
    updateLocation
};
