// src/web/index.js
const express = require('express');
const cors = require('cors')
const usersRouter = require('./routes/usersRouter');
const restaurantsRouter = require('./routes/restaurantsRouter');
const searchRouter = require ('./routes/searchRouter');
const ordersRouter = require('./routes/orderRouter');
const usersController = require('./controllers/usersController');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Mount routers to specific paths
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/search', searchRouter);
app.use('/api/orders', ordersRouter);

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