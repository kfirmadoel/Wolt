const assert = require('assert');
const request = require('supertest');
const { api, auth, createUser, createRestaurant, createProduct, createOrder, restaurantDetails, jsonError, empty204 } = require('./helpers');
const { app } = require('../index');
const Product = require('../models/productModel');

const gate = () => {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    return { promise, release };
};

const waitFor = async (promise) => {
    let timer;
    try {
        await Promise.race([promise, new Promise((resolve, reject) => {
            timer = setTimeout(() => reject(new Error("Timed out waiting for the controlled database operation")), 3000);
        })]);
    } finally {
        clearTimeout(timer);
    }
};

describe("Restaurants API", () => {
    let owner, other, customer;

    before(async () => {
        owner = await createUser('restaurant_owner');
        other = await createUser('restaurant_owner');
        customer = await createUser();
    });

    it("creates a restaurant for its JWT owner and exposes public menu information", async () => {
        const id = await createRestaurant(owner, { name: '  Restaurant listing fixture  ', ownerId: other.id });
        const detail = await api.get(`/api/restaurants/${id}`).expect(200);
        assert.strictEqual(detail.body.name, 'Restaurant listing fixture');
        assert.strictEqual(detail.body.ownerId, owner.id);
        const list = await api.get('/api/restaurants').expect(200);
        assert.ok(list.body.some(restaurant => restaurant.id === id));
        const mine = await api.get('/api/restaurants/mine').set(auth(owner)).expect(200);
        assert.ok(mine.body.some(restaurant => restaurant.id === id));
        const theirs = await api.get('/api/restaurants/mine').set(auth(other)).expect(200);
        assert.ok(!theirs.body.some(restaurant => restaurant.id === id));
    });

    it("protects creation and changes with JWT, role and ownership", async () => {
        const id = await createRestaurant(owner);
        jsonError(await api.post('/api/restaurants').send(restaurantDetails()), 403);
        jsonError(await api.post('/api/restaurants').set(auth(customer)).send(restaurantDetails()), 403);
        jsonError(await api.patch(`/api/restaurants/${id}`).set(auth(other)).send({ name: 'Forbidden' }), 403);
        jsonError(await api.delete(`/api/restaurants/${id}`).set(auth(other)), 403);
        jsonError(await api.get('/api/restaurants/mine').set(auth(customer)), 403);
        const detail = await api.get(`/api/restaurants/${id}`).expect(200);
        assert.strictEqual(detail.body.name, 'Test Kitchen');
    });

    it("partially updates editable fields with an empty 204 and preserves other values", async () => {
        const id = await createRestaurant(owner);
        const before = await api.get(`/api/restaurants/${id}`);
        empty204(await api.patch(`/api/restaurants/${id}`).set(auth(owner)).send({ name: '  Updated kitchen  ', phone: '', ownerId: other.id, id: 'forged' }));
        const after = await api.get(`/api/restaurants/${id}`).expect(200);
        assert.strictEqual(after.body.name, 'Updated kitchen');
        assert.strictEqual(after.body.phone, '');
        for (const field of ['id', 'ownerId', 'description', 'address', 'picture', 'category', 'isPromoted', 'location']) {
            assert.deepStrictEqual(after.body[field], before.body[field]);
        }
    });

    it("rejects invalid create/update fields atomically", async () => {
        const id = await createRestaurant(owner);
        const before = await api.get(`/api/restaurants/${id}`);
        const invalid = [{ name: ' ' }, { phone: 'abc' }, { category: 'Not a category' }, { isPromoted: 'false' }, { picture: '' }, { location: { x: '1', y: 0 } }];
        for (const fields of invalid) {
            jsonError(await api.post('/api/restaurants').set(auth(owner)).send(restaurantDetails(fields)), 400);
            jsonError(await api.patch(`/api/restaurants/${id}`).set(auth(owner)).send({ description: 'Must not save', ...fields }), 400);
        }
        const after = await api.get(`/api/restaurants/${id}`);
        assert.deepStrictEqual(after.body, before.body);
    });

    it("returns 404 for a missing restaurant", async () => {
        jsonError(await api.get('/api/restaurants/missing-restaurant'), 404);
        jsonError(await api.patch('/api/restaurants/missing-restaurant').set(auth(owner)).send({ name: 'Missing' }), 404);
    });

    it("deletes only its products and preserves unrelated menus and order snapshots", async () => {
        const id = await createRestaurant(owner, { name: 'Cascade kitchen' });
        const productId = await createProduct(owner, id, { name: 'Cascade dish' });
        const unrelatedId = await createRestaurant(other);
        const unrelatedProduct = await createProduct(other, unrelatedId);
        const order = await createOrder(customer, id, productId);
        const orderCount = (await api.get('/api/orders').set(auth(customer)).expect(200)).body.length;
        empty204(await api.delete(`/api/restaurants/${id}`).set(auth(owner)));
        jsonError(await api.get(`/api/restaurants/${id}`), 404);
        jsonError(await api.delete(`/api/restaurants/${id}`).set(auth(owner)), 404);
        jsonError(await api.post('/api/orders').set(auth(customer)).send({ restaurantId: id, items: [{ productId, quantity: 1 }] }), 404);
        assert.strictEqual((await api.get('/api/orders').set(auth(customer)).expect(200)).body.length, orderCount);
        assert.strictEqual(await Product.countDocuments({ restaurantId: id }), 0);
        await api.get(`/api/restaurants/${unrelatedId}/products/${unrelatedProduct}`).expect(200);
        const history = await api.get(`/api/orders/${order.id}`).set(auth(customer)).expect(200);
        assert.deepStrictEqual(history.body.items, order.items);
        assert.strictEqual(history.body.totalPrice, order.totalPrice);
        empty204(await api.patch(`/api/orders/${order.id}`).set(auth(customer)).send({ status: 'completed' }));
    });

    for (const pauseCascade of [false, true]) {
        it(`rejects an in-flight product save ${pauseCascade ? 'before' : 'after'} the deleted restaurant's product cleanup`, async () => {
            const id = await createRestaurant(owner);
            const name = pauseCascade ? 'Late dish before cleanup' : 'Late dish after cleanup';
            const saveReached = gate();
            const resumeSave = gate();
            const cleanupReached = gate();
            const resumeCleanup = gate();
            const originalSave = Product.prototype.save;
            const originalDeleteMany = Product.deleteMany;
            let creating, deleting;

            Product.prototype.save = async function (...args) {
                if (this.restaurantId === id && this.name === name) {
                    saveReached.release();
                    await resumeSave.promise;
                }
                return originalSave.apply(this, args);
            };
            Product.deleteMany = async function (filter, ...args) {
                if (pauseCascade && filter.restaurantId === id) {
                    cleanupReached.release();
                    await resumeCleanup.promise;
                }
                return originalDeleteMany.call(this, filter, ...args);
            };

            try {
                // Separate test servers let either response finish while the other request is paused.
                creating = request(app).post(`/api/restaurants/${id}/products`).set(auth(owner)).timeout({ deadline: 5000 })
                    .send({ name, price: 10 }).then(reply => reply);
                await waitFor(saveReached.promise);
                deleting = request(app).delete(`/api/restaurants/${id}`).set(auth(owner)).timeout({ deadline: 5000 }).then(reply => reply);
                if (pauseCascade) {
                    await waitFor(cleanupReached.promise);
                } else {
                    empty204(await deleting);
                }
                jsonError(await api.get(`/api/restaurants/${id}`), 404);

                resumeSave.release();
                jsonError(await creating, 404);
                resumeCleanup.release();
                empty204(await deleting);
                assert.strictEqual(await Product.countDocuments({ restaurantId: id }), 0);
                const search = await api.get('/api/search/' + encodeURIComponent(name)).expect(200);
                assert.ok(!search.body.products.some(product => product.restaurantId === id));
            } finally {
                resumeSave.release();
                resumeCleanup.release();
                await Promise.allSettled([creating, deleting].filter(Boolean));
                Product.prototype.save = originalSave;
                Product.deleteMany = originalDeleteMany;
            }
        });
    }
});
