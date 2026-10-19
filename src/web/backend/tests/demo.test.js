const assert = require('assert');
const path = require('path');
const { execFile } = require('child_process');
const { randomBytes } = require('crypto');
const mongoose = require('mongoose');
// Let the helper verify an empty database before collections are created.
mongoose.set('autoCreate', false);
mongoose.set('autoIndex', false);
const { api, auth, connectTestDatabase, closeTestDatabase, createUser, createRestaurant, createProduct, createOrder } = require('./helpers');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const demo = require('../demo/restaurants.json');
const { app } = require('../index');

const models = [User, Restaurant, Product, Order];
const password = 'Demo1' + randomBytes(12).toString('hex');
const runDemo = (demoPassword = password) => new Promise((resolve) => {
    execFile(process.execPath, [path.join(__dirname, '../demo/load.js')], {
        env: { ...process.env, DEMO_PASSWORD: demoPassword },
        timeout: 15000
    }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, stdout, stderr }));
});

const snapshot = async () => {
    const result = [];
    for (const model of models) result.push(await model.find({}).sort({ id: 1 }).lean());
    return JSON.stringify(result);
};

const load = async (demoPassword) => {
    const result = await runDemo(demoPassword);
    assert.strictEqual(result.code, 0, result.stderr);
    return result;
};

describe('Demo data import', () => {
    let server;
    const read = async (route, token) => {
        const response = await fetch('http://127.0.0.1:' + server.address().port + route, {
            headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
        assert.strictEqual(response.status, 200, route);
        return response.json();
    };

    before(async () => {
        await connectTestDatabase();
        for (const model of models) await model.createIndexes();
        await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    });
    after(async () => {
        if (server) {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
        }
        await closeTestDatabase();
    });

    beforeEach(async () => {
        // The helper creates and guards a separate, initially empty test database.
        for (const model of models) await model.deleteMany({});
    });

    it('loads six restaurants and twelve dishes with images and a valid owner', async () => {
        await load();
        assert.strictEqual(await User.countDocuments(), 1);
        assert.strictEqual(await Restaurant.countDocuments(), 6);
        assert.strictEqual(await Product.countDocuments(), 12);
        const login = await api.post('/api/tokens').send({ username: 'wolt_demo_owner', password }).expect(200);
        const owner = { token: login.body.token };
        const profile = await read('/api/users/' + login.body.id, owner.token);
        assert.strictEqual(profile.role, 'restaurant_owner');
        const mine = await read('/api/restaurants/mine', owner.token);
        assert.strictEqual(mine.length, 6);
        const list = await read('/api/restaurants');
        assert.strictEqual(list.length, 6);
        for (const restaurant of demo) {
            const saved = list.find(item => item.id === restaurant.id);
            assert.strictEqual(saved.name, restaurant.name);
            assert.strictEqual(saved.ownerId, login.body.id);
            assert.deepStrictEqual(saved.location, restaurant.location);
            assert.match(saved.picture, /^data:image\/jpeg;base64,\/9j\//);
            const menu = await read(`/api/restaurants/${saved.id}/products`);
            assert.strictEqual(menu.length, 2);
            for (const product of restaurant.products) {
                const dish = menu.find(item => item.id === product.id);
                assert.strictEqual(dish.name, product.name);
                assert.strictEqual(dish.price, product.price);
                assert.strictEqual(dish.restaurantId, saved.id);
                assert.match(dish.picture, /^data:image\/jpeg;base64,\/9j\//);
            }
        }
    });

    it('keeps every record unchanged when run again without a password', async () => {
        await load();
        const before = await snapshot();
        const result = await load('');
        assert.match(result.stdout, /added 0 owner, 0 restaurants and 0 dishes/);
        assert.strictEqual(await snapshot(), before);
    });

    it('preserves renamed data, edited prices, other owners and existing orders', async () => {
        const other = await createUser('restaurant_owner');
        const restaurantId = await createRestaurant(other, { name: demo[0].name });
        const productId = await createProduct(other, restaurantId);
        await createOrder(other, restaurantId, productId);
        await load();
        const login = await api.post('/api/tokens').send({ username: 'wolt_demo_owner', password }).expect(200);
        const owner = { token: login.body.token };
        await api.patch('/api/restaurants/' + demo[0].id).set(auth(owner)).send({ name: 'Renamed kitchen' }).expect(204);
        await api.patch(`/api/restaurants/${demo[0].id}/products/${demo[0].products[0].id}`)
            .set(auth(owner)).send({ name: 'Renamed dish', price: 49 }).expect(204);
        const before = await snapshot();
        await load('');
        assert.strictEqual(await snapshot(), before);
    });

    it('restores only missing demo records after a partial import or deletion', async () => {
        await load();
        const keptRestaurant = await Restaurant.findOne({ id: demo[1].id }).lean();
        const keptDish = await Product.findOne({ id: demo[1].products[1].id }).lean();
        await Restaurant.deleteOne({ id: demo[0].id });
        await Product.deleteMany({ restaurantId: demo[0].id });
        await Product.deleteOne({ id: demo[1].products[0].id });
        const result = await load('');
        assert.match(result.stdout, /added 0 owner, 1 restaurants and 3 dishes/);
        assert.strictEqual(await Restaurant.countDocuments(), 6);
        assert.strictEqual(await Product.countDocuments(), 12);
        assert.deepStrictEqual(await Restaurant.findOne({ id: demo[1].id }).lean(), keptRestaurant);
        assert.deepStrictEqual(await Product.findOne({ id: demo[1].products[1].id }).lean(), keptDish);
    });

    it('rejects a missing or invalid password on a fresh database without inserting records', async () => {
        for (const invalid of ['', 'short', 'abcdefgh', '12345678']) {
            const result = await runDemo(invalid);
            assert.strictEqual(result.code, 1);
            assert.match(result.stderr, /Set DEMO_PASSWORD/);
            for (const model of models) assert.strictEqual(await model.countDocuments(), 0);
        }
    });

    it('does not adopt an existing account with the demo username', async () => {
        const other = await createUser('restaurant_owner');
        await User.updateOne({ id: other.id }, { username: 'wolt_demo_owner' });
        const before = await snapshot();
        const result = await runDemo();
        assert.strictEqual(result.code, 1);
        assert.match(result.stderr, /owner ID or username is already in use/);
        assert.strictEqual(await snapshot(), before);
    });

    it('does not change a conflicting demo owner role or restaurant owner', async () => {
        await load();
        await User.updateOne({ id: 'user_wolt_demo_owner' }, { role: 'customer' });
        let before = await snapshot();
        let result = await runDemo();
        assert.strictEqual(result.code, 1);
        assert.strictEqual(await snapshot(), before);
        await User.updateOne({ id: 'user_wolt_demo_owner' }, { role: 'restaurant_owner' });
        await Restaurant.updateOne({ id: demo[5].id }, { ownerId: 'another_owner' });
        await Restaurant.deleteOne({ id: demo[0].id });
        before = await snapshot();
        result = await runDemo();
        assert.strictEqual(result.code, 1);
        assert.match(result.stderr, /belongs to another owner/);
        assert.strictEqual(await snapshot(), before);
    });

    it('checks product ID conflicts before restoring missing restaurants', async () => {
        await load();
        await Restaurant.deleteOne({ id: demo[0].id });
        await Product.updateOne({ id: demo[5].products[1].id }, { restaurantId: demo[4].id });
        const before = await snapshot();
        const result = await runDemo();
        assert.strictEqual(result.code, 1);
        assert.match(result.stderr, /belongs to another restaurant/);
        assert.strictEqual(await snapshot(), before);
    });
});
