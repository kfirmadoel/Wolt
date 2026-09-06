const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

describe("Users API", () => {

    let userId;

    it("17. should create user", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send({
                username: "kfir123",
                password: "secret1",
                name: "Kfir Cohen",
                phone: "052-1112222",
                address: "10 Herzl St"
            });

        assert.strictEqual(res.status, 201);
        userId = res.body.id;
    });

    it("18. duplicate username should fail", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send({
                username: "kfir123",
                password: "other"
            });

        // userModel.create() returns null on a duplicate username -
        // check whichever status your controller maps that to
        assert.ok(res.status === 400 || res.status === 409);
    });

    it("19. should get user", async () => {
        const res = await request(BASE).get(`/api/users/${userId}`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, "kfir123");
        assert.strictEqual(res.body.name, "Kfir Cohen");
    });

    // Per the assignment: "the output will contain the user's id if the
    // user exists, or an appropriate error message if not" - NOT a token.
    it("20. should return the user id on successful login", async () => {
        const res = await request(BASE)
            .post("/api/tokens")
            .send({ username: "kfir123", password: "secret1" });

        assert.strictEqual(res.status, 200);
        // adjust the field name below (id / userId) to match your controller
        assert.ok(
            res.body.id === userId || res.body.userId === userId,
            `Expected response to contain the user's id (got: ${JSON.stringify(res.body)})`
        );
    });

    it("21. should return an error for wrong password", async () => {
        const res = await request(BASE)
            .post("/api/tokens")
            .send({ username: "kfir123", password: "wrongpass" });

        assert.ok(res.status >= 400, "Expected an error status for bad credentials");
        assert.ok(res.body.error, "Expected an error message in the response body");
    });
});