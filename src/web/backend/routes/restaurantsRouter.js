// src/web/routes/restaurantsRouter.js
const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurantsController');
const productRouter = require('./productRouter');
const middleware = require('../controllers/middlewares');

router.use('/:id/products', productRouter)

// Shared chain for routes that modify a restaurant that must already exist
// and must belong to the logged-in owner.
const requireOwnerAccess = [
    middleware.requireAuth,
    middleware.requireRole('restaurant_owner'),
    middleware.checkRestaurant,
    middleware.checkOwnership
];

router.route('/')
    .get(restaurantsController.getAllRestaurants)
    .post(middleware.requireAuth, middleware.requireRole('restaurant_owner'), restaurantsController.createRestaurant);
    
router.route('/:id')
    .get(restaurantsController.getRestaurantById)
    .patch(...requireOwnerAccess, restaurantsController.updateRestaurant)
    .delete(...requireOwnerAccess, restaurantsController.deleteRestaurant);

module.exports = router;