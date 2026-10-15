const assert = require('assert');
const { api, auth, createUser, createRestaurant, createProduct, createOrder, restaurantDetails, jsonError, empty204 } = require('./helpers');

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
        empty204(await api.delete(`/api/restaurants/${id}`).set(auth(owner)));
        jsonError(await api.get(`/api/restaurants/${id}`), 404);
        const Product = require('../models/productModel');
        assert.strictEqual(await Product.countDocuments({ restaurantId: id }), 0);
        await api.get(`/api/restaurants/${unrelatedId}/products/${unrelatedProduct}`).expect(200);
        const history = await api.get(`/api/orders/${order.id}`).set(auth(customer)).expect(200);
        assert.deepStrictEqual(history.body.items, order.items);
        assert.strictEqual(history.body.totalPrice, order.totalPrice);
        empty204(await api.patch(`/api/orders/${order.id}`).set(auth(customer)).send({ status: 'completed' }));
    });
});
