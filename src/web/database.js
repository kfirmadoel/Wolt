// src/web/database.js

// Global arrays (In-Memory Database)
// Data will be cleared upon server restart, which is expected per instructions.
const users = [];
const restaurants = [];
const orders = [];

module.exports = {
    // --- User Management ---
    getUsers: () => users,
    addUser: (user) => users.push(user),
    getUserById: (id) => users.find(u => u.id === id),

    // --- Restaurant Management ---
    getRestaurants: () => restaurants,
    addRestaurant: (restaurant) => restaurants.push(restaurant),
    getRestaurantById: (id) => restaurants.find(r => r.id === id),
    deleteRestaurant: (id) => {
        const index = restaurants.findIndex(r => r.id === id);
        if (index !== -1) {
            restaurants.splice(index, 1);
            return true; // Successfully deleted
        }
        return false; // Not found
    },

    // --- Order Management (Infrastructure for DevOps/Orders epic) ---
    getOrders: () => orders,
    addOrder: (order) => orders.push(order)
};