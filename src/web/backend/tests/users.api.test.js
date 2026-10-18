const assert = require('node:assert/strict');
const {
    api,
    authorized,
    createUser,
    uniqueName
} = require('./helpers');

describe('Users API', () => {
    let user;

    before(async () => {
        user = await createUser();
    });

    it('creates a user and does not return their password in the profile', async () => {
        const response = await authorized(api.get(`/api/users/${user.id}`), user.token);

        assert.equal(response.status, 200);
        assert.equal(response.body.id, user.id);
        assert.equal(response.body.username, user.username);
        assert.equal(response.body.password, undefined);
    });

    it('rejects profile access without authentication', async () => {
        const response = await api.get(`/api/users/${user.id}`);

        assert.equal(response.status, 403);
        assert.ok(response.body.error);
    });

    it('rejects access to another user profile', async () => {
        const otherUser = await createUser();
        const response = await authorized(
            api.get(`/api/users/${user.id}`),
            otherUser.token
        );

        assert.equal(response.status, 403);
    });

    it('rejects duplicate usernames', async () => {
        const response = await api.post('/api/users').send({
            username: user.username,
            password: 'secret123',
            name: 'Duplicate User',
            picture: 'data:image/png;base64,aGVsbG8=',
            role: 'customer',
            location: { x: 32.0853, y: 34.7818 }
        });

        assert.equal(response.status, 409);
    });

    it('rejects invalid registration data', async () => {
        const response = await api.post('/api/users').send({
            username: uniqueName('invalid-user'),
            password: 'short',
            name: 'Invalid User',
            picture: 'data:image/png;base64,aGVsbG8=',
            role: 'customer',
            location: { x: 32.0853, y: 34.7818 }
        });

        assert.equal(response.status, 400);
        assert.ok(response.body.error);
    });

    it('rejects incorrect login credentials', async () => {
        const response = await api.post('/api/tokens').send({
            username: user.username,
            password: 'incorrect123'
        });

        assert.equal(response.status, 401);
        assert.ok(response.body.error);
    });
});
