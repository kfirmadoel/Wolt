const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

// The assignment requires passing the logged-in user's id as an HTTP header
// for any request that requires login (e.g. placing/reading an order).
// Adjust "x-user-id" to whatever header name your controllers actually read.
const authHeader = (userId) => ({ "x-user-id": userId });

describe("Orders API", () => {

    let restId, productId, userId, orderId;

    before(async () => {
        const r1 = await request(BASE)
            .post("/api/restaurants")
            .send({
                name: "Order Rest",
                description: "desc",
                address: "addr",
                phone: "050-0000000"
            });
        restId = r1.headers.location.split("/").pop();

        const p1 = await request(BASE)
            .post(`/api/restaurants/${restId}/products`)
            .send({
                name: "Burger",
                description: "desc",
                price: 30
            });
        productId = p1.headers.location.split("/").pop();

        const u1 = await request(BASE)
            .post("/api/users")
            .send({
                username: "orderUser",
                password: "pass",
                name: "Test User",
                phone: "050-0000000",
                address: "addr"
            });
        userId = u1.body.id;
    });

    it("22. should create order", async () => {
        const res = await request(BASE)
            .post("/api/orders")
            .set(authHeader(userId))
            .send({
                userId,
                restaurantId: restId,
                items: [{ productId, quantity: 2 }]
            });

        assert.strictEqual(res.status, 201);
        orderId = res.headers.location.split("/").pop();
    });

    it("23. should get order", async () => {
        const res = await request(BASE)
            .get(`/api/orders/${orderId}`)
            .set(authHeader(userId));

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.items[0].quantity, 2);
        assert.strictEqual(res.body.status, "pending");
    });

    it("24. GET /api/orders should list the logged-in user's orders", async () => {
        const res = await request(BASE)
            .get("/api/orders")
            .set(authHeader(userId));

        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.body));
        assert.ok(res.body.some(o => o.id === orderId));
    });

    it("25. should update order status", async () => {
        const res = await request(BASE)
            .patch(`/api/orders/${orderId}`)
            .set(authHeader(userId))
            .send({ status: "confirmed" });

        assert.strictEqual(res.status, 204);
    });

    it("26. should update items and recalc total", async () => {
        await request(BASE)
            .patch(`/api/orders/${orderId}`)
            .set(authHeader(userId))
            .send({ items: [{ productId, quantity: 5 }] });

        const res = await request(BASE)
            .get(`/api/orders/${orderId}`)
            .set(authHeader(userId));

        assert.strictEqual(res.body.items[0].quantity, 5);
        assert.strictEqual(res.body.status, "confirmed");
        assert.strictEqual(res.body.totalPrice, 150); // 30 * 5
    });

    it("27. should delete order", async () => {
        const res = await request(BASE)
            .delete(`/api/orders/${orderId}`)
            .set(authHeader(userId));

        assert.strictEqual(res.status, 204);
    });

    // CLEANUP
    after(async () => {
        const orders = await request(BASE)
            .get("/api/orders")
            .set(authHeader(userId));
        for (const o of orders.body || []) {
            await request(BASE)
                .delete(`/api/orders/${o.id}`)
                .set(authHeader(userId));
        }

        const products = await request(BASE).get(`/api/restaurants/${restId}/products`);
        for (const p of products.body) {
            await request(BASE).delete(`/api/restaurants/${restId}/products/${p.id}`);
        }

        await request(BASE).delete(`/api/restaurants/${restId}`);
    });
});