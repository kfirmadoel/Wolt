// models/orderModel.js
const db = require('../database');

const getAll = () => db.getOrders();

const getById = (id) => db.getOrderById(id);

const getByUserId = (userId) => db.getOrdersByUserId(userId);

const create = (data) => {
    const order = {
        id: 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        userId: data.userId,
        restaurantId: data.restaurantId,
        items: data.items,       // [{ productId, quantity }, ...]
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
    order.items = data.items ?? order.items;

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