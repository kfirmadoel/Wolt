// src/web/database.js
/*
// Global arrays (In-Memory Database)
// Data will be cleared upon server restart, which is expected per instructions.
const users = [];
const restaurants = [];
const orders = [];
const products = [];


// --- User Management ---
const getUsers = () => users;
const addUser = (user) => users.push(user);
const getUserById = (id) => users.find(u => u.id === id);
const getUserByUsername = (username) => users.find(u => u.username === username);

// --- Restaurant Management ---
const getRestaurants = () => restaurants;
const addRestaurant = (restaurant) => restaurants.push(restaurant);
const getRestaurantById = (id) => restaurants.find(r => r.id === id);
const deleteRestaurant = (id) => {
    const index = restaurants.findIndex(r => r.id === id);
    if (index !== -1) {
        restaurants.splice(index, 1);
        return true;
    }
    return false;
};

// --- Product Management ---
const getProducts = () => products;
const addProduct = (product) => products.push(product);
const getProductById = (id) => products.find(p => p.id === id);
const getProductsByRestaurantId = (restaurantId) => products.filter(p => p.restaurantId === restaurantId);
const getProductByRestaurantAndId = (pId, restaurantId) => products.find(p => p.id === pId && p.restaurantId === restaurantId);
const deleteProduct = (id) => {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        return true;
    }
    return false;
};

// --- Order Management ---
const getOrders = () => orders;
const addOrder = (order) => orders.push(order);
const getOrderById = (id) => orders.find(o => o.id === id);
const getOrdersByUserId = (userId) => orders.filter(o => o.userId === userId);
const deleteOrder = (id) => {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders.splice(index, 1);
        return true;
    }
    return false;
};

module.exports = {
    // Users
    getUsers, addUser, getUserById, getUserByUsername,
    // Restaurants
    getRestaurants, addRestaurant, getRestaurantById, deleteRestaurant,
    // Products
    getProducts, addProduct, getProductById, getProductsByRestaurantId, getProductByRestaurantAndId, deleteProduct,
    // Orders
    getOrders, addOrder, getOrderById, getOrdersByUserId, deleteOrder
};*/