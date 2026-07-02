// controllers/middlewares
const db = require('../database');

const verifyUser = (req, res, next) => {
    // Extract the user ID from the custom header (Express automatically lowercases header names)
    const userId = req.headers['x-user-id'];

    if (userId){
        req.userId = userId;
    }
    // Proceed to the next middleware or route handler
    next();
};


const checkRestaurant = (req, res, next) => {
    // Retrieve the restaurant using the ID from the URL parameters
    const restaurant = db.getRestaurantById(req.params.id);
    
    // If the restaurant is not found, halt the request and return a 404 status
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    
    // Attach the restaurant object to the request to prevent redundant DB calls later
    req.restaurant = restaurant; 
    
    // Proceed to the next middleware or route handler
    next();
};

module.exports = {
    verifyUser,
    checkRestaurant
};