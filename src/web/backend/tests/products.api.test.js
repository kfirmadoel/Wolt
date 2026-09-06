const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

describe("Products API", () => {

    let restId;
    let productId;

    before(async () => {
        const res = await request(BASE)
            .post("/api/restaurants")
            .send({
                name: "Test Rest",
                description: "desc",
                address: "addr",
                phone: "050-0000000"
            });

        restId = res.headers.location.split("/").pop();
    });

    it("12. should create product", async () => {
        const res = await request(BASE)
            .post(`/api/restaurants/${restId}/products`)
            .send({
                name: "Margherita",
                description: "Classic tomato & mozzarella",
                price: 45
            });

        assert.strictEqual(res.status, 201);
        productId = res.headers.location.split("/").pop();
    });

    it("13. should list products", async () => {
        const res = await request(BASE)
            .get(`/api/restaurants/${restId}/products`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 1);
    });

    it("14. should get product", async () => {
        const res = await request(BASE)
            .get(`/api/restaurants/${restId}/products/${productId}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.id, productId);
        assert.strictEqual(res.body.price, 45);
    });

    it("15. should update product price", async () => {
        const res = await request(BASE)
            .patch(`/api/restaurants/${restId}/products/${productId}`)
            .send({ price: 49 });

        assert.strictEqual(res.status, 204);

        const check = await request(BASE)
            .get(`/api/restaurants/${restId}/products/${productId}`);
        assert.strictEqual(check.body.price, 49);
    });

    it("16. should delete product", async () => {
        const res = await request(BASE)
            .delete(`/api/restaurants/${restId}/products/${productId}`);

        assert.strictEqual(res.status, 204);
    });

    // CLEANUP - restaurantId-scoped, safe with current models
    after(async () => {
        const res = await request(BASE).get(`/api/restaurants/${restId}/products`);
        for (const p of res.body) {
            await request(BASE).delete(`/api/restaurants/${restId}/products/${p.id}`);
        }
        await request(BASE).delete(`/api/restaurants/${restId}`);
    });
});