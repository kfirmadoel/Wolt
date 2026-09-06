const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

// The assignment spec is explicit: http://foo.com/api/search/:query
// This is a PATH parameter, not a query string (?q=...).
describe("Search API", () => {

    let restId;

    before(async () => {
        const res = await request(BASE)
            .post("/api/restaurants")
            .send({
                name: "Pizza Palace Deluxe",
                description: "desc",
                address: "addr",
                phone: "050-0000000"
            });

        restId = res.headers.location.split("/").pop();
    });

    it("28. should find restaurant by name", async () => {
        const res = await request(BASE).get(`/api/search/pizza`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.restaurants.length, 1);
        assert.strictEqual(res.body.restaurants[0].id, restId);
    });

    it("29. should return empty results", async () => {
        const res = await request(BASE).get(`/api/search/doesnotexistanywhere`);
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, { restaurants: [], products: [] });
    });

    // CLEANUP - restaurantModel has getById/deleteRestaurant, safe
    after(async () => {
        await request(BASE).delete(`/api/restaurants/${restId}`);
    });
});