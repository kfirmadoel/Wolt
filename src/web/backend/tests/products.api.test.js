const assert = require('node:assert/strict');
const {
    api,
    authorized,
    createUser,
    createRestaurant,
    createProduct
} = require('./helpers');

describe('Products API', () => {
    let owner;
    let restaurantId;
    let productId;

    before(async () => {
        owner = await createUser('restaurant_owner');
        restaurantId = await createRestaurant(owner.token);
        productId = await createProduct(owner.token, restaurantId);
    });

    after(async () => {
        if (restaurantId) {
            await authorized(
                api.delete(`/api/restaurants/${restaurantId}`),
                owner.token
            );
        }
    });

    it('lists and retrieves products for a restaurant', async () => {
        const list = await api.get(`/api/restaurants/${restaurantId}/products`);
        const response = await api.get(
            `/api/restaurants/${restaurantId}/products/${productId}`
        );

        assert.equal(list.status, 200);
        assert.ok(list.body.some((product) => product.id === productId));
        assert.equal(response.status, 200);
        assert.equal(response.body.id, productId);
        assert.equal(response.body.price, 25);
    });

    it('allows the restaurant owner to update and delete a product', async () => {
        const update = await authorized(
            api.patch(`/api/restaurants/${restaurantId}/products/${productId}`),
            owner.token
        ).send({ price: 49 });
        const updated = await api.get(
            `/api/restaurants/${restaurantId}/products/${productId}`
        );
        const deletion = await authorized(
            api.delete(`/api/restaurants/${restaurantId}/products/${productId}`),
            owner.token
        );

        assert.equal(update.status, 204);
        assert.equal(updated.body.price, 49);
        assert.equal(deletion.status, 204);
    });

    it('rejects a product with a non-positive price', async () => {
        const response = await authorized(
            api.post(`/api/restaurants/${restaurantId}/products`),
            owner.token
        ).send({ name: 'Invalid product', price: 0 });

        assert.equal(response.status, 400);
        assert.ok(response.body.error);
    });

    it('returns 404 for an unknown product', async () => {
        const response = await api.get(
            `/api/restaurants/${restaurantId}/products/not-a-real-product`
        );

        assert.equal(response.status, 404);
    });
});
