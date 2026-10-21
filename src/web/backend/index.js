// src/web/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors')
const connectDB = require('./services/mongoService');
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
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

const frontendPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
    app.use(express.static(frontendPath));
    app.get('/{*page}', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: "Request body must contain valid JSON" });
    }
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ error: "Request body is too large" });
    }
    res.status(500).json({ error: "Could not process the request. Please try again." });
});

const PORT = Number(process.env.BACKEND_PORT) || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces for Docker

if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`Server is running on ${HOST}:${PORT}`);
        });
    });
}

module.exports = { app, PORT };
