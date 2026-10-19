const assert = require('assert');
const { api, auth, createUser, createRestaurant, createProduct, createOrder, jsonError, empty204 } = require('./helpers');

describe("Orders API", () => {
    let owner, customer, otherCustomer, restaurantId, productId, foreignProduct;

    before(async () => {
        owner = await createUser('restaurant_owner');
        customer = await createUser();
        otherCustomer = await createUser();
        restaurantId = await createRestaurant(owner, { name: 'Order kitchen' });
        productId = await createProduct(owner, restaurantId, { name: 'Order dish', price: 30 });
        const foreignRestaurant = await createRestaurant(owner);
        foreignProduct = await createProduct(owner, foreignRestaurant);
    });

    it("creates a 201 JSON receipt and snapshots using server prices and JWT identity", async () => {
        const created = await api.post('/api/orders').set(auth(customer)).send({
            restaurantId, userId: otherCustomer.id, totalPrice: 1,
            items: [{ productId, quantity: 2, name: 'Forged', price: 1 }]
        }).expect(201);
        assert.strictEqual(created.headers.location, '/api/orders/' + created.body.id);
        assert.strictEqual(created.body.userId, customer.id);
        assert.strictEqual(created.body.restaurantName, 'Order kitchen');
        assert.strictEqual(created.body.items[0].name, 'Order dish');
        assert.strictEqual(created.body.items[0].price, 30);
        assert.strictEqual(created.body.totalPrice, 60);
        assert.strictEqual(created.body.status, 'pending');
    });

    it("only lists and exposes the signed-in user's orders", async () => {
        const mine = await createOrder(customer, restaurantId, productId);
        const theirs = await createOrder(otherCustomer, restaurantId, productId);
        const list = await api.get('/api/orders').set(auth(customer)).expect(200);
        assert.ok(list.body.some(order => order.id === mine.id));
        assert.ok(!list.body.some(order => order.id === theirs.id));
        for (const method of ['get', 'patch', 'delete']) {
            const call = api[method](`/api/orders/${mine.id}`).set(auth(otherCustomer));
            if (method === 'patch') call.send({ status: 'completed' });
            jsonError(await call, 403);
        }
        jsonError(await api.get(`/api/orders/${mine.id}`), 403);
        jsonError(await api.get(`/api/orders/${mine.id}`).set('Authorization', 'Bearer invalid'), 401);
    });

    it("rejects invalid quantities, foreign or missing products and empty orders", async () => {
        const before = await api.get('/api/orders').set(auth(customer));
        for (const quantity of [0, -1, 1.5, '2', true, null]) {
            jsonError(await api.post('/api/orders').set(auth(customer)).send({ restaurantId, items: [{ productId, quantity }] }), 400);
        }
        for (const items of [[], null, [{ productId: foreignProduct, quantity: 1 }], [{ productId: 'missing-product', quantity: 1 }]]) {
            jsonError(await api.post('/api/orders').set(auth(customer)).send({ restaurantId, items }), 400);
        }
        jsonError(await api.post('/api/orders').set(auth(customer)).send({ restaurantId: 'missing-restaurant', items: [{ productId, quantity: 1 }] }), 404);
        const after = await api.get('/api/orders').set(auth(customer));
        assert.deepStrictEqual(after.body, before.body);
    });

    it("updates items and valid status with 204 and recalculates totals", async () => {
        const order = await createOrder(customer, restaurantId, productId);
        empty204(await api.patch(`/api/orders/${order.id}`).set(auth(customer)).send({ status: 'completed', items: [{ productId, quantity: 3 }], userId: otherCustomer.id }));
        const updated = await api.get(`/api/orders/${order.id}`).set(auth(customer)).expect(200);
        assert.strictEqual(updated.body.userId, customer.id);
        assert.strictEqual(updated.body.status, 'completed');
        assert.strictEqual(updated.body.items[0].quantity, 3);
        assert.strictEqual(updated.body.totalPrice, 90);
    });

    it("preserves order data after failed edits and invalid request bodies", async () => {
        const order = await createOrder(customer, restaurantId, productId);
        const route = `/api/orders/${order.id}`;
        for (const body of [{ status: 'confirmed' }, { status: 'cancelled', items: [{ productId: foreignProduct, quantity: 1 }] }, { items: [] }, {}]) {
            jsonError(await api.patch(route).set(auth(customer)).send(body), 400);
        }
        jsonError(await api.patch(route).set(auth(customer)).set('Content-Type', 'application/json').send('null'), 400);
        const after = await api.get(route).set(auth(customer)).expect(200);
        assert.deepStrictEqual(after.body, order);
    });

    it("keeps history after product changes/deletion and rejects a stale checkout", async () => {
        const itemId = await createProduct(owner, restaurantId, { name: 'Snapshot dish', price: 15 });
        const order = await createOrder(customer, restaurantId, itemId);
        const itemRoute = `/api/restaurants/${restaurantId}/products/${itemId}`;
        empty204(await api.patch(itemRoute).set(auth(owner)).send({ name: 'New dish name', price: 50 }));
        const old = await api.get(`/api/orders/${order.id}`).set(auth(customer)).expect(200);
        assert.deepStrictEqual(old.body.items, order.items);
        const fresh = await createOrder(customer, restaurantId, itemId);
        assert.strictEqual(fresh.totalPrice, 100);
        assert.strictEqual(fresh.items[0].name, 'New dish name');
        empty204(await api.delete(itemRoute).set(auth(owner)));
        jsonError(await api.post('/api/orders').set(auth(customer)).send({ restaurantId, items: [{ productId: itemId, quantity: 1 }] }), 400);
        jsonError(await api.patch(`/api/orders/${order.id}`).set(auth(customer)).send({ items: [{ productId: itemId, quantity: 1 }] }), 400);
        empty204(await api.patch(`/api/orders/${order.id}`).set(auth(customer)).send({ status: 'cancelled' }));
        const history = await api.get(`/api/orders/${order.id}`).set(auth(customer)).expect(200);
        assert.deepStrictEqual(history.body.items, order.items);
        assert.strictEqual(history.body.totalPrice, 30);
    });

    it("deletes owned orders with 204 and returns 404 for missing orders", async () => {
        const order = await createOrder(customer, restaurantId, productId);
        empty204(await api.delete(`/api/orders/${order.id}`).set(auth(customer)));
        for (const method of ['get', 'patch', 'delete']) {
            const call = api[method](`/api/orders/${order.id}`).set(auth(customer));
            if (method === 'patch') call.send({ status: 'completed' });
            jsonError(await call, 404);
        }
    });
});
