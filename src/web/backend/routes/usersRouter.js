// src/web/routes/usersRouter.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Map endpoints to controller functions
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUser);

module.exports = router;