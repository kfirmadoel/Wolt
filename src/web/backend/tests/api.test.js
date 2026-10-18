const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../index');

describe('API service', () => {
    it('reports healthy status', async () => {
        const response = await request(app).get('/api/health');

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { status: 'ok' });
    });
});
