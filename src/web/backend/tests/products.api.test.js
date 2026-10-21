const assert = require('assert');
const { api, auth, createUser, createRestaurant, createProduct, picture, jsonError, empty204 } = require('./helpers');

describe("Products API", () => {
    let owner, other, customer, restaurantId, secondRestaurant;

    before(async () => {
        owner = await createUser('restaurant_owner');
        other = await createUser('restaurant_owner');
        customer = await createUser();
        restaurantId = await createRestaurant(owner);
        secondRestaurant = await createRestaurant(owner);
    });
    const base = () => `/api/restaurants/${restaurantId}/products`;

    it("creates and publicly reads products with valid optional pictures", async () => {
        const id = await createProduct(owner, restaurantId, { name: '  Product fixture  ' });
        const detail = await api.get(`${base()}/${id}`).expect(200);
        assert.strictEqual(detail.body.name, 'Product fixture');
        assert.strictEqual(detail.body.picture, picture);
        assert.strictEqual(detail.body.price, 12.5);
        const list = await api.get(base()).expect(200);
        assert.ok(list.body.some(product => product.id === id));
    });

    it("accepts a minimal product without picture, description or category", async () => {
        const created = await api.post(base()).set(auth(owner)).send({ name: 'Minimal dish', price: 0.01 }).expect(201);
        const detail = await api.get(created.headers.location).expect(200);
        assert.strictEqual(detail.body.picture, '');
        assert.strictEqual(detail.body.description, '');
        assert.strictEqual(detail.body.category, '');
        assert.strictEqual(detail.body.price, 0.01);
    });

    it("blocks missing JWT, customers and different restaurant owners", async () => {
        const id = await createProduct(owner, restaurantId);
        jsonError(await api.post(base()).send({ name: 'Unauthorized', price: 10 }), 403);
        for (const user of [customer, other]) {
            jsonError(await api.post(base()).set(auth(user)).send({ name: 'Unauthorized', price: 10 }), 403);
            jsonError(await api.patch(`${base()}/${id}`).set(auth(user)).send({ price: 1 }), 403);
            jsonError(await api.delete(`${base()}/${id}`).set(auth(user)), 403);
        }
        const detail = await api.get(`${base()}/${id}`).expect(200);
        assert.strictEqual(detail.body.price, 12.5);
    });

    it("cannot use a product through another restaurant, even with the same owner", async () => {
        const id = await createProduct(owner, restaurantId);
        const wrongRoute = `/api/restaurants/${secondRestaurant}/products/${id}`;
        jsonError(await api.get(wrongRoute), 404);
        jsonError(await api.patch(wrongRoute).set(auth(owner)).send({ price: 1 }), 404);
        jsonError(await api.delete(wrongRoute).set(auth(owner)), 404);
        await api.get(`${base()}/${id}`).expect(200);
    });

    it("rejects invalid types and prices before writing any part of the product", async () => {
        const id = await createProduct(owner, restaurantId);
        const before = await api.get(`${base()}/${id}`);
        const count = (await api.get(base())).body.length;
        const invalid = [{ name: ' ' }, { name: [] }, { price: 0 }, { price: -1 }, { price: '30' }, { price: true }, { price: [30] }, { price: null }, { description: null }, { category: [] }, { picture: {} }];
        for (const fields of invalid) {
            jsonError(await api.post(base()).set(auth(owner)).send({ name: 'Invalid product', price: 1, ...fields }), 400);
            jsonError(await api.patch(`${base()}/${id}`).set(auth(owner)).send({ description: 'Must not save', ...fields }), 400);
        }
        for (const body of ['null', '[]', '{"name":"Invalid","price":1e309}']) {
            jsonError(await api.post(base()).set(auth(owner)).set('Content-Type', 'application/json').send(body), 400);
            jsonError(await api.patch(`${base()}/${id}`).set(auth(owner)).set('Content-Type', 'application/json').send(body), 400);
        }
        assert.strictEqual((await api.get(base())).body.length, count);
        assert.deepStrictEqual((await api.get(`${base()}/${id}`)).body, before.body);
    });

    it("partially updates allowed fields and can remove an optional image", async () => {
        const id = await createProduct(owner, restaurantId);
        const before = await api.get(`${base()}/${id}`);
        empty204(await api.patch(`${base()}/${id}`).set(auth(owner)).send({ price: 25, picture: '', restaurantId: secondRestaurant, id: 'forged' }));
        const after = await api.get(`${base()}/${id}`).expect(200);
        assert.strictEqual(after.body.price, 25);
        assert.strictEqual(after.body.picture, '');
        for (const field of ['id', 'restaurantId', 'name', 'description', 'category']) assert.strictEqual(after.body[field], before.body[field]);
    });

    it("deletes a product with an empty 204 and returns 404 afterwards", async () => {
        const id = await createProduct(owner, restaurantId);
        empty204(await api.delete(`${base()}/${id}`).set(auth(owner)));
        jsonError(await api.get(`${base()}/${id}`), 404);
        jsonError(await api.delete(`${base()}/${id}`).set(auth(owner)), 404);
        const list = await api.get(base()).expect(200);
        assert.ok(!list.body.some(product => product.id === id));
    });
});
