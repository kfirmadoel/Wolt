// src/web/index.js
const express = require('express');
const usersRouter = require('./routes/usersRouter');
const restaurantsRouter = require('./routes/restaurantsRouter');
const searchRouter = require ('./routes/searchRouter');
const usersController = require('./controllers/usersController');

const app = express();
app.use(express.json());

// Mount routers to specific paths
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/search', searchRouter);

// Token endpoint is standalone, mapped directly to the controller
app.post('/api/tokens', usersController.loginUser);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});