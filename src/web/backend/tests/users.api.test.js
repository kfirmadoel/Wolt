const assert = require('assert');
const { api, auth, createUser, userDetails, jsonError } = require('./helpers');
const User = require('../models/userModel');

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

    it("treats surrounding username whitespace as the same existing account", async () => {
        jsonError(await api.post('/api/users').send({ ...user.details, username: '  ' + user.details.username + '  ' }), 409);
        assert.strictEqual(await User.countDocuments({ username: user.details.username }), 1);
        assert.strictEqual(await User.countDocuments({ username: '  ' + user.details.username + '  ' }), 0);
    });

    it("creates exactly one account when the same username is registered concurrently", async () => {
        await User.init();
        const details = userDetails();
        const replies = await Promise.all(Array.from({ length: 5 }, () => api.post('/api/users').send(details)));
        assert.strictEqual(await User.countDocuments({ username: details.username }), 1);
        assert.strictEqual(replies.filter(reply => reply.status === 201).length, 1);
        for (const reply of replies.filter(reply => reply.status !== 201)) {
            jsonError(reply, 409);
        }
    });

    it("rejects invalid registration fields", async () => {
        for (const fields of [{ password: 'short' }, { name: ' ' }, { picture: '' }, { role: 'admin' }]) {
            jsonError(await api.post('/api/users').send(userDetails(fields)), 400);
        }
    });

    it("returns 400 for missing or non-object registration bodies without creating an account", async () => {
        const count = await User.countDocuments({});
        jsonError(await api.post('/api/users'), 400);
        for (const body of ['null', '[]', '"text"', '42']) {
            jsonError(await api.post('/api/users').set('Content-Type', 'application/json').send(body), 400);
        }
        assert.strictEqual(await User.countDocuments({}), count);
    });

    it("returns 400 for missing or non-object login bodies instead of a server error", async () => {
        jsonError(await api.post('/api/tokens'), 400);
        for (const body of ['null', '[]', '"text"', '42']) {
            jsonError(await api.post('/api/tokens').set('Content-Type', 'application/json').send(body), 400);
        }
    });

    it("rejects invalid registration coordinates without creating an account", async () => {
        const count = await User.countDocuments({});
        for (const location of [null, [], {}, { x: '32.1', y: 34.7 }, { x: 32.1, y: true }, { x: 91, y: 0 }, { x: 0, y: -181 }]) {
            jsonError(await api.post('/api/users').send(userDetails({ location })), 400);
        }
        for (const location of ['{"x":1e309,"y":0}', '{"x":0,"y":-1e309}']) {
            const details = userDetails();
            delete details.location;
            const body = JSON.stringify(details).slice(0, -1) + ',"location":' + location + '}';
            jsonError(await api.post('/api/users').set('Content-Type', 'application/json').send(body), 400);
        }
        assert.strictEqual(await User.countDocuments({}), count);
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
