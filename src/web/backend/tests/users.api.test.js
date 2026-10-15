const assert = require('assert');
const { api, auth, createUser, userDetails, jsonError } = require('./helpers');

describe("Users API", () => {
    let user, other;

    before(async () => {
        user = await createUser();
        other = await createUser();
    });

    it("registers and logs in with the current JWT contract", async () => {
        const profile = await api.get(`/api/users/${user.id}`).set(auth(user)).expect(200);
        assert.strictEqual(profile.body.username, user.details.username);
        assert.strictEqual(profile.body.name, user.details.name);
        assert.strictEqual(profile.body.picture, user.details.picture);
        assert.strictEqual(profile.body.password, undefined);
    });

    it("rejects duplicate usernames and invalid credentials", async () => {
        jsonError(await api.post('/api/users').send(user.details), 409);
        jsonError(await api.post('/api/tokens').send({ username: user.details.username, password: 'wrong123' }), 401);
        jsonError(await api.post('/api/tokens').send({ username: { $ne: null }, password: 'wrong123' }), 400);
    });

    it("rejects invalid registration fields", async () => {
        for (const fields of [{ password: 'short' }, { name: ' ' }, { picture: '' }, { role: 'admin' }]) {
            jsonError(await api.post('/api/users').send(userDetails(fields)), 400);
        }
    });

    it("rejects missing, invalid and other-user tokens for profile access", async () => {
        jsonError(await api.get(`/api/users/${user.id}`), 403);
        jsonError(await api.get(`/api/users/${user.id}`).set('Authorization', 'Bearer invalid'), 401);
        jsonError(await api.get(`/api/users/${user.id}`).set(auth(other)), 403);
    });

    it("persists own location and ignores protected profile fields", async () => {
        const location = { x: -90, y: 180 };
        const updated = await api.patch(`/api/users/${user.id}/location`).set(auth(user))
            .send({ location, role: 'restaurant_owner', name: 'Other name' }).expect(200);
        assert.deepStrictEqual(updated.body.location, location);
        const profile = await api.get(`/api/users/${user.id}`).set(auth(user)).expect(200);
        assert.deepStrictEqual(profile.body.location, location);
        assert.strictEqual(profile.body.role, 'customer');
        assert.strictEqual(profile.body.name, user.details.name);
        jsonError(await api.patch(`/api/users/${user.id}/location`).set(auth(other)).send({ location: { x: 0, y: 0 } }), 403);
    });

    it("rejects invalid location types, ranges and bodies without changing the profile", async () => {
        const before = await api.get(`/api/users/${user.id}`).set(auth(user));
        const route = `/api/users/${user.id}/location`;
        for (const location of [null, [], {}, { x: '0', y: 0 }, { x: 0, y: true }, { x: 91, y: 0 }, { x: 0, y: -181 }]) {
            jsonError(await api.patch(route).set(auth(user)).send({ location }), 400);
        }
        for (const body of ['null', '[]', '{"location":{"x":1e309,"y":0}}']) {
            jsonError(await api.patch(route).set(auth(user)).set('Content-Type', 'application/json').send(body), 400);
        }
        const after = await api.get(`/api/users/${user.id}`).set(auth(user));
        assert.deepStrictEqual(after.body, before.body);
    });

    it("returns JSON for malformed requests and unknown API paths", async () => {
        jsonError(await api.post('/api/tokens').set('Content-Type', 'application/json').send('{"username":'), 400);
        jsonError(await api.get('/api/does-not-exist'), 404);
    });

    it("reports healthy after the test database has connected", async () => {
        await api.get('/api/health').expect(200);
    });
});
