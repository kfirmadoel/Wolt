const assert = require('assert');
const express = require('express');
const request = require('supertest');
const productsController = require('../controllers/productsController');

const app = express();
app.use(express.json());
app.get('/api/restaurants/:id/products/:pId', (req, res) => {
    req.userId = 'test-user';
    productsController.getProductById(req, res);
});

describe('Products Controller', function() {
    it('should return 404 for missing product', async () => {
        const response = await request(app).get('/api/restaurants/1/products/unknown');
        assert.strictEqual(response.status, 404);
    });
});
