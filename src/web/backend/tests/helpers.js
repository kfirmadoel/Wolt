const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');

// Tests use their own database and never call an already running web server.
const mongoBase = process.env.TEST_MONGO_URI;
assert.ok(mongoBase, "Set TEST_MONGO_URI to a local test Mongo server, without a database name");
const mongoAddress = new URL(mongoBase);
assert.ok(mongoAddress.protocol === 'mongodb:' && ['127.0.0.1', 'localhost', 'mongo-tests'].includes(mongoAddress.hostname), "Tests require localhost or the mongo-tests service");
assert.ok(!mongoAddress.pathname || mongoAddress.pathname === '/', "TEST_MONGO_URI must not contain a database name");
assert.ok(!mongoAddress.search && !mongoAddress.username && !mongoAddress.password, "Use a plain local test Mongo address");
const databaseName = 'wolt_test_' + Date.now() + '_' + randomBytes(6).toString('hex');
const mongoPort = Number(mongoAddress.port || 27017);
const mongoUri = 'mongodb://' + mongoAddress.host + '/' + databaseName;
process.env.MONGO_URI = mongoUri;
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.NODE_ENV = 'test';

const { app } = require('../index');
const api = request(app);
const picture = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'fixtures/picture.png')).toString('base64');
let mayDropDatabase = false;
let nextUser = 0;

const connectTestDatabase = async () => {
    assert.strictEqual(mongoose.connection.readyState, 0, "Importing the app must not open Mongo");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    assert.strictEqual(mongoose.connection.name, databaseName);
    assert.strictEqual(mongoose.connection.host, mongoAddress.hostname);
    assert.strictEqual(mongoose.connection.port, mongoPort);
    const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
    assert.strictEqual(collections.length, 0, "Refusing to run against a nonempty database");
    mayDropDatabase = true;
};

const closeTestDatabase = async () => {
    try {
        if (mayDropDatabase) {
            const connection = mongoose.connection;
            assert.ok(/^wolt_test_\d+_[a-f0-9]{12}$/.test(databaseName));
            assert.strictEqual(connection.name, databaseName);
            assert.strictEqual(connection.db.databaseName, databaseName);
            assert.strictEqual(connection.host, mongoAddress.hostname);
            assert.strictEqual(connection.port, mongoPort);
            await connection.db.dropDatabase();
        }
    } finally {
        await mongoose.disconnect();
    }
};

const userDetails = (fields = {}) => ({
    username: 'test_user_' + (++nextUser),
    password: 'TestPassword123',
    name: 'Test User',
    picture,
    role: 'customer',
    location: { x: 0, y: 0 },
    ...fields
});

const createUser = async (role = 'customer') => {
    const details = userDetails({ role });
    const created = await api.post('/api/users').send(details).expect(201);
    const login = await api.post('/api/tokens').send({ username: details.username, password: details.password }).expect(200);
    assert.strictEqual(login.body.id, created.body.id);
    assert.strictEqual(typeof login.body.token, 'string');
    return { id: created.body.id, token: login.body.token, details };
};

const auth = (user) => ({ Authorization: 'Bearer ' + user.token });
const restaurantDetails = (fields = {}) => ({
    name: 'Test Kitchen', description: 'Test description', address: 'Test address', phone: '0501234567',
    category: 'Pizza', picture, isPromoted: false, location: { x: 0, y: 0 }, ...fields
});
const locationId = (response, prefix) => {
    assert.ok(response.headers.location?.startsWith(prefix));
    return response.headers.location.slice(prefix.length);
};
const createRestaurant = async (owner, fields = {}) => {
    const created = await api.post('/api/restaurants').set(auth(owner)).send(restaurantDetails(fields)).expect(201);
    assert.strictEqual(created.text, '');
    return locationId(created, '/api/restaurants/');
};
const createProduct = async (owner, restaurantId, fields = {}) => {
    const route = `/api/restaurants/${restaurantId}/products`;
    const created = await api.post(route).set(auth(owner)).send({ name: 'Test Dish', description: 'Dish description', category: 'Mains', price: 12.5, picture, ...fields }).expect(201);
    assert.strictEqual(created.text, '');
    return locationId(created, route + '/');
};
const createOrder = async (user, restaurantId, productId, quantity = 2) => {
    const created = await api.post('/api/orders').set(auth(user)).send({ restaurantId, items: [{ productId, quantity }] }).expect(201);
    assert.strictEqual(created.headers.location, '/api/orders/' + created.body.id);
    return created.body;
};
const jsonError = (response, code) => {
    assert.strictEqual(response.status, code);
    assert.match(response.headers['content-type'], /application\/json/);
    assert.strictEqual(typeof response.body.error, 'string');
    assert.ok(response.body.error);
};
const empty204 = (response) => {
    assert.strictEqual(response.status, 204);
    assert.strictEqual(response.text, '');
};

module.exports = { api, auth, picture, userDetails, restaurantDetails, createUser, createRestaurant, createProduct, createOrder, jsonError, empty204, locationId, connectTestDatabase, closeTestDatabase };
