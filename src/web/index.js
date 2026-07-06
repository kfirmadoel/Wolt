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

// Health check endpoint for Docker and monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces for Docker

app.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});