const assert = require('node:assert/strict');
const {
    api,
    authorized,
    createUser,
    createRestaurant,
    createProduct
} = require('./helpers');

describe('Search API', () => {
    let owner;
    let restaurantId;
    let productId;

    before(async () => {
        owner = await createUser('restaurant_owner');
        restaurantId = await createRestaurant(owner.token, 'Searchable Pizza Place');
        productId = await createProduct(owner.token, restaurantId, 'Searchable Pasta');
    });

    after(async () => {
        if (restaurantId) {
            await authorized(
                api.delete(`/api/restaurants/${restaurantId}`),
                owner.token
            );
        }
    });

    it('finds matching restaurants and products case-insensitively', async () => {
        const response = await api.get('/api/search/searchable');

        assert.equal(response.status, 200);
        assert.ok(response.body.restaurants.some(
            (restaurant) => restaurant.id === restaurantId
        ));
        assert.ok(response.body.products.some(
            (product) => product.id === productId
        ));
    });

    it('returns empty lists when there are no matches', async () => {
        const response = await api.get(
            '/api/search/no-match-for-this-test-query-123456'
        );

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { restaurants: [], products: [] });
    });
});
