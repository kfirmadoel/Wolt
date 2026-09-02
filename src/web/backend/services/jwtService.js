// web/backend/services/jwtService.js
const jwt = require('jsonwebtoken');

const key = process.env.JWT_SECRET || "temporary-dev-key-change-me";

const signToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, key);
};

const verifyToken = (token) => {
    return jwt.verify(token, key); // throws if invalid
};

module.exports = { signToken, verifyToken };