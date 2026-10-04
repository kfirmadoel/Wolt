// src/web/routes/usersRouter.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const middleware = require('../controllers/middlewares');

// Map endpoints to controller functions
router.post('/', usersController.createUser);
router.get('/:id', middleware.requireAuth, usersController.getUser);

// Update the geolocation of a user (requires authentication — users can only update their own)
router.patch('/:id/location', middleware.requireAuth, usersController.updateUserLocation);

module.exports = router;
