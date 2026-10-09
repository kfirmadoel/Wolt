const assert = require('node:assert/strict');
const {
    api,
    authorized,
    createUser,
    createRestaurant,
    createProduct
} = require('./helpers');

describe('Orders API', () => {
    let customer;
    let owner;
    let restaurantId;
    let productId;
    let orderId;

    before(async () => {
        customer = await createUser();
        owner = await createUser('restaurant_owner');
        restaurantId = await createRestaurant(owner.token);
        productId = await createProduct(owner.token, restaurantId);
    });

    after(async () => {
        if (orderId) {
            await authorized(api.delete(`/api/orders/${orderId}`), customer.token);
        }
        if (restaurantId) {
            await authorized(
                api.delete(`/api/restaurants/${restaurantId}`),
                owner.token
            );
        }
    });

    it('creates an order for the authenticated user', async () => {
        const response = await authorized(api.post('/api/orders'), customer.token)
            .send({
                restaurantId,
                items: [{ productId, quantity: 2 }]
            });

        assert.equal(response.status, 201);
        assert.ok(response.headers.location);
        orderId = response.body.id;
        assert.equal(response.body.userId, customer.id);
        assert.equal(response.body.totalPrice, 50);
    });

    it('lists and retrieves only the authenticated user order', async () => {
        const list = await authorized(api.get('/api/orders'), customer.token);
        const response = await authorized(
            api.get(`/api/orders/${orderId}`),
            customer.token
        );

        assert.equal(list.status, 200);
        assert.ok(list.body.some((order) => order.id === orderId));
        assert.equal(response.status, 200);
        assert.equal(response.body.items[0].quantity, 2);
        assert.equal(response.body.status, 'pending');
    });

    it('updates order items and recalculates the total', async () => {
        const update = await authorized(
            api.patch(`/api/orders/${orderId}`),
            customer.token
        ).send({
            status: 'confirmed',
            items: [{ productId, quantity: 5 }]
        });
        const response = await authorized(
            api.get(`/api/orders/${orderId}`),
            customer.token
        );

        assert.equal(update.status, 204);
        assert.equal(response.body.status, 'confirmed');
        assert.equal(response.body.items[0].quantity, 5);
        assert.equal(response.body.totalPrice, 125);
    });

    it('rejects requests without authentication and empty orders', async () => {
        const unauthenticated = await api.get('/api/orders');
        const emptyOrder = await authorized(
            api.post('/api/orders'),
            customer.token
        ).send({ restaurantId, items: [] });

        assert.equal(unauthenticated.status, 403);
        assert.equal(emptyOrder.status, 400);
    });
});
