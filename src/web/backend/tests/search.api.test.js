const assert = require('assert');
const { api, auth, createUser, createRestaurant, createProduct, empty204 } = require('./helpers');

describe("Search API", () => {
    let owner, restaurantId, productId;

    before(async () => {
        owner = await createUser('restaurant_owner');
        restaurantId = await createRestaurant(owner, { name: 'SearchFixture kitchen', description: 'Search description marker' });
        productId = await createProduct(owner, restaurantId, { name: 'SearchFixture dish', description: 'A literal + character' });
    });

    it("finds restaurant and product names case-insensitively through the path parameter", async () => {
        const found = await api.get('/api/search/searchfixture').expect(200);
        assert.deepStrictEqual(found.body.restaurants.map(item => item.id), [restaurantId]);
        assert.deepStrictEqual(found.body.products.map(item => item.id), [productId]);
    });

    it("searches descriptions and treats regular expression characters literally", async () => {
        const description = await api.get('/api/search/' + encodeURIComponent('description marker')).expect(200);
        assert.deepStrictEqual(description.body.restaurants.map(item => item.id), [restaurantId]);
        const literal = await api.get('/api/search/' + encodeURIComponent('+')).expect(200);
        assert.deepStrictEqual(literal.body.products.map(item => item.id), [productId]);
        assert.deepStrictEqual(literal.body.restaurants, []);
    });

    it("returns empty arrays for a missing term", async () => {
        const found = await api.get('/api/search/term-not-present-in-fixtures').expect(200);
        assert.deepStrictEqual(found.body, { restaurants: [], products: [] });
    });

    it("stops returning products after their restaurant is deleted", async () => {
        empty204(await api.delete(`/api/restaurants/${restaurantId}`).set(auth(owner)));
        const found = await api.get('/api/search/SearchFixture').expect(200);
        assert.deepStrictEqual(found.body, { restaurants: [], products: [] });
    });
});
