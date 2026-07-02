// src/web/routes/restaurantsRouter.js
const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurantsController');
const productRouter = require('./productRouter');

// check if the reataurant exist.
router.use('/:id/products', productRouter)

router.route('/')
    .get(restaurantsController.getAllRestaurants)
    .post(restaurantsController.createRestaurant);
    
router.route('/:id')
    .get(restaurantsController.getRestaurantById)
    .patch(restaurantsController.updateRestaurant)
    .delete(restaurantsController.deleteRestaurant);

module.exports = router;