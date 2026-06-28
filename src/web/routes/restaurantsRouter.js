// src/web/routes/restaurantsRouter.js
const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurantsController');

router.get('/', restaurantsController.getAllRestaurants);
router.post('/', restaurantsController.createRestaurant);
router.get('/:id', restaurantsController.getRestaurantById);
router.patch('/:id', restaurantsController.updateRestaurant);
router.delete('/:id', restaurantsController.deleteRestaurant);

module.exports = router;