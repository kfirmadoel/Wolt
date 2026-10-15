const { connectTestDatabase, closeTestDatabase } = require('./helpers');

before(async () => {
    await connectTestDatabase();
});

after(async () => {
    await closeTestDatabase();
});

require('./users.api.test');
require('./restaurants.api.test');
require('./products.api.test');
require('./orders.api.test');
require('./search.api.test');
