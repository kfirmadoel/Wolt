const assert = require('node:assert/strict');
const {
    api,
    authorized,
    createUser,
    createRestaurant
} = require('./helpers');

describe('Restaurants API', () => {
    let owner;
    let restaurantId;

    before(async () => {
        owner = await createUser('restaurant_owner');
        restaurantId = await createRestaurant(owner.token);
    });

    after(async () => {
        if (restaurantId) {
            await authorized(
                api.delete(`/api/restaurants/${restaurantId}`),
                owner.token
            );
        }
    });

    it('lists restaurant categories', async () => {
        const response = await api.get('/api/restaurants/categories');

        assert.equal(response.status, 200);
        assert.ok(response.body.includes('Burgers'));
    });

    it('lists restaurants and retrieves the created restaurant', async () => {
        const list = await api.get('/api/restaurants');
        const response = await api.get(`/api/restaurants/${restaurantId}`);

        assert.equal(list.status, 200);
        assert.ok(list.body.some((restaurant) => restaurant.id === restaurantId));
        assert.equal(response.status, 200);
        assert.equal(response.body.id, restaurantId);
    });

    it('allows the owner to update their restaurant', async () => {
        const update = await authorized(
            api.patch(`/api/restaurants/${restaurantId}`),
            owner.token
        ).send({ name: 'Updated Test Restaurant' });
        const response = await api.get(`/api/restaurants/${restaurantId}`);

        assert.equal(update.status, 204);
        assert.equal(response.body.name, 'Updated Test Restaurant');
        assert.equal(response.body.description, 'Restaurant created by an API test');
    });

    it('prevents customers from creating restaurants', async () => {
        const customer = await createUser();
        const response = await authorized(
            api.post('/api/restaurants'),
            customer.token
        ).send({ name: 'Unauthorized Restaurant' });

        assert.equal(response.status, 403);
    });

    it('returns an error for a missing restaurant', async () => {
        const response = await api.get('/api/restaurants/not-a-real-restaurant');

        assert.equal(response.status, 404);
    });
});
