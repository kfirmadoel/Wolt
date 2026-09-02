// models/orderModel.js
const db = require('../database');

const getAll = () => db.getOrders();

const getById = (id) => db.getOrderById(id);

const getByUserId = (userId) => db.getOrdersByUserId(userId);

const calculateTotalPrice = (items, restaurantId) => {
    if (!Array.isArray(items) || items.length === 0) {
        return 0;
    }

    return items.reduce((total, item) => {
        // Support item.productId or item.id for flexibility
        const productId = item.productId ?? item.id;
        const product = db.getProductByRestaurantAndId(productId, restaurantId);
        if (!product) return total;

        // Coerce stored price to a number (handles numeric strings)
        const price = Number(product.price);
        if (!Number.isFinite(price)) return total;

        const quantity = Number(item.quantity) || 1;
        return total + (price * quantity);
    }, 0);
};

const create = (data) => {
    const order = {
        id: 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        userId: data.userId,
        restaurantId: data.restaurantId,
        items: data.items,       // [{ productId, quantity }, ...]
        totalPrice: calculateTotalPrice(data.items, data.restaurantId),
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    db.addOrder(order);
    return order;
};

const update = (id, data) => {
    const order = db.getOrderById(id);
    if (!order) return null;

    order.status = data.status ?? order.status;
    if (data.items) {
        order.items = data.items;
        order.totalPrice = calculateTotalPrice(order.items, order.restaurantId);
    }

    return order;
};

const deleteOrder = (id) => db.deleteOrder(id);

module.exports = {
    getAll,
    getByUserId,
    getById,
    create,
    update,
    deleteOrder
}; 