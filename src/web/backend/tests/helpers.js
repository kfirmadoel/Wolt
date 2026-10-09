const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../index');

const api = request(app);

const uniqueName = (prefix) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function createUser(role = 'customer') {
    const username = uniqueName('test-user');
    const password = 'secret123';
    const registration = await api.post('/api/users').send({
        username,
        password,
        name: 'Test User',
        picture: 'data:image/png;base64,aGVsbG8=',
        role,
        location: { x: 32.0853, y: 34.7818 }
    });

    assert.equal(registration.status, 201, JSON.stringify(registration.body));

    const login = await api.post('/api/tokens').send({ username, password });
    assert.equal(login.status, 200, JSON.stringify(login.body));

    return { id: registration.body.id, username, token: login.body.token };
}

function authorized(requestBuilder, token) {
    return requestBuilder.set('Authorization', `Bearer ${token}`);
}

async function createRestaurant(ownerToken, name = uniqueName('Test Restaurant')) {
    const response = await authorized(api.post('/api/restaurants'), ownerToken).send({
        name,
        description: 'Restaurant created by an API test',
        address: '1 Test Street',
        phone: '0501234567',
        category: 'Burgers',
        picture: 'data:image/png;base64,aGVsbG8=',
        isPromoted: false,
        location: { x: 32.0853, y: 34.7818 }
    });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.headers.location.split('/').pop();
}

async function createProduct(ownerToken, restaurantId, name = uniqueName('Test Product')) {
    const response = await authorized(
        api.post(`/api/restaurants/${restaurantId}/products`),
        ownerToken
    ).send({
        name,
        description: 'Product created by an API test',
        category: 'Burgers',
        picture: 'data:image/png;base64,aGVsbG8=',
        price: 25
    });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.headers.location.split('/').pop();
}

module.exports = {
    api,
    authorized,
    createUser,
    createRestaurant,
    createProduct,
    uniqueName
};
