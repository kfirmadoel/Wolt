const db = require('../database');

describe("FULL API TEST SUITE", () => {

    describe("Restaurants Suite", () => {
        require("./restaurants.api.test");
    });

    describe("Products Suite", () => {
        require("./products.api.test");
    });

    describe("Users Suite", () => {
        require("./users.api.test");
    });

    describe("Orders Suite", () => {
        require("./orders.api.test");
    });

    describe("Search Suite", () => {
        require("./search.api.test");
    });
});