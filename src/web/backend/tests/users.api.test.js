const assert = require('assert');
const request = require('supertest');

const BASE = "http://web-server:3000";

describe("Users API", () => {

    let userId;
    let token;
    let otherToken;

    const userDetails = (username) => ({
        username,
        password: "secret123",
        name: "Kfir Cohen",
        picture: "data:image/png;base64,aGVsbG8=",
        role: "customer",
        location: { x: 32.0853, y: 34.7818 }
    });

    it("17. should create user", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send(userDetails("kfir123"));

        assert.strictEqual(res.status, 201);
        userId = res.body.id;
    });

    it("18. duplicate username should fail", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send(userDetails("kfir123"));

        // userModel.create() returns null on a duplicate username -
        // check whichever status your controller maps that to
        assert.ok(res.status === 400 || res.status === 409);
    });

    it("19. should reject profile access without a token", async () => {
        const res = await request(BASE).get(`/api/users/${userId}`);
        assert.strictEqual(res.status, 403);
    });

    it("20. should return a token on successful login", async () => {
        const res = await request(BASE)
            .post("/api/tokens")
            .send({ username: "kfir123", password: "secret123" });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.id, userId);
        token = res.body.token;
    });

    it("21. should allow a user to read their own profile", async () => {
        const res = await request(BASE)
            .get(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${token}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, "kfir123");
        assert.strictEqual(res.body.name, "Kfir Cohen");
        assert.strictEqual(res.body.password, undefined);
    });

    it("22. should reject reading another user's profile", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send(userDetails("other-user"));

        assert.strictEqual(res.status, 201);

        const loginRes = await request(BASE)
            .post("/api/tokens")
            .send({ username: "other-user", password: "secret123" });
        otherToken = loginRes.body.token;

        const profileRes = await request(BASE)
            .get(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${otherToken}`);
        assert.strictEqual(profileRes.status, 403);
    });

    it("21. should return an error for wrong password", async () => {
        const res = await request(BASE)
            .post("/api/tokens")
            .send({ username: "kfir123", password: "wrongpass" });

        assert.ok(res.status >= 400, "Expected an error status for bad credentials");
        assert.ok(res.body.error, "Expected an error message in the response body");
    });

    it("24. should reject invalid registration fields", async () => {
        const res = await request(BASE)
            .post("/api/users")
            .send({ ...userDetails("invalid-user"), password: "short" });

        assert.strictEqual(res.status, 400);
        assert.ok(res.body.error);
    });
});