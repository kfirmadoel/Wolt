// controllers/middlewares
const restaurantService = require('../services/restaurantService');
const jwtService = require('../services/jwtService');

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: "Please log in to continue" });
    }

    try {
        const decoded = jwtService.verifyToken(token);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Session expired, please log in again" });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwtService.verifyToken(token);
            req.userId = decoded.id;
            req.userRole = decoded.role;
        } catch (err) {
            // not a valid login, but that's fine here — just continue as a guest
        }
    }

    next();
};

const requireRole = (role) => (req, res, next) => {
    if (req.userRole !== role) {
        return res.status(403).json({ error: "You don't have permission to perform this action" });
    }
    next();
};

const checkRestaurant = async (req, res, next) => {
    const restaurant = await restaurantService.getById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    req.restaurant = restaurant;
    next();
};

const checkOwnership = (req, res, next) => {
    if (req.restaurant.ownerId !== req.userId) {
        return res.status(403).json({ error: "This isn't your restaurant!!" });
    }
    next();
};

module.exports = {
    requireAuth,
    optionalAuth,
    requireRole,
    checkRestaurant,
    checkOwnership
};