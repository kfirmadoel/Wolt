const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

describe("Restaurants API", () => {

    let id1, id2;

    it("1. should return empty list", async () => {
        const res = await request(BASE).get("/api/restaurants");
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    it("2. should create restaurant 1", async () => {
        const res = await request(BASE)
            .post("/api/restaurants")
            .send({
                name: "Pizza Palace",
                description: "Best pizza in town",
                address: "123 Main St",
                phone: "050-1234567"
            });

        assert.strictEqual(res.status, 201);
        id1 = res.headers.location.split("/").pop();
    });

    it("3. should create restaurant 2", async () => {
        const res = await request(BASE)
            .post("/api/restaurants")
            .send({
                name: "Sushi Spot",
                description: "Fresh sushi daily",
                address: "45 Ocean Ave",
                phone: "050-7654321"
            });

        assert.strictEqual(res.status, 201);
        id2 = res.headers.location.split("/").pop();
    });

    it("4. should list all restaurants", async () => {
        const res = await request(BASE).get("/api/restaurants");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
    });

    it("5. should get restaurant 1", async () => {
        const res = await request(BASE).get(`/api/restaurants/${id1}`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.name, "Pizza Palace");
    });

    it("6. should update restaurant 1", async () => {
        const res = await request(BASE)
            .patch(`/api/restaurants/${id1}`)
            .send({ name: "Pizza Palace Deluxe", phone: "050-9999999" });

        assert.strictEqual(res.status, 204);
    });

    it("7. should confirm update", async () => {
        const res = await request(BASE).get(`/api/restaurants/${id1}`);
        assert.strictEqual(res.body.name, "Pizza Palace Deluxe");
        assert.strictEqual(res.body.phone, "050-9999999");
        // description/address must survive a partial PATCH (model uses ?? not ||)
        assert.strictEqual(res.body.description, "Best pizza in town");
        assert.strictEqual(res.body.address, "123 Main St");
    });

    it("8. should return 400 when name is missing", async () => {
        const res = await request(BASE)
            .post("/api/restaurants")
            .send({ description: "no name" });

        assert.strictEqual(res.status, 400);
        assert.ok(res.body.error);
    });

    it("9. should return 404 for missing restaurant", async () => {
        const res = await request(BASE)
            .patch("/api/restaurants/doesnotexist")
            .send({ name: "whatever" });

        assert.strictEqual(res.status, 404);
        assert.ok(res.body.error);
    });

    it("10. should delete restaurant 2", async () => {
        const res = await request(BASE).delete(`/api/restaurants/${id2}`);
        assert.strictEqual(res.status, 204);
    });

    it("11. final list should contain only restaurant 1", async () => {
        const res = await request(BASE).get("/api/restaurants");
        assert.strictEqual(res.body.length, 1);
        assert.strictEqual(res.body[0].id, id1);
    });

    // CLEANUP - restaurantModel has getAll + deleteRestaurant, so this is safe
    after(async () => {
        const res = await request(BASE).get("/api/restaurants");
        for (const r of res.body) {
            await request(BASE).delete(`/api/restaurants/${r.id}`);
        }
    });
});