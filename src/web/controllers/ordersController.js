// src/web/controllers/ordersController.js
const orderModel = require('../models/orderModel');

const getAllOrders = (req, res) => {
    res.status(200).json(orderModel.getByUserId(req.userId));
};

const createOrder = (req, res) => {
    const { restaurantId, items } = req.body;

    if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const newOrder = orderModel.create({ userId: req.userId, restaurantId, items });

    res.status(201).location(`/api/orders/${newOrder.id}`).send();
};

const getOrderById = (req, res) => {
    const order = orderModel.getById(req.params.id);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
};

const updateOrder = (req, res) => {
    if (req.body.status !== undefined && req.body.status.trim() === "") {
        return res.status(400).json({ error: "Status cannot be empty" });
    }

    const updatedOrder = orderModel.update(req.params.id, req.body);

    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.status(204).send();
};

const deleteOrder = (req, res) => {
    const success = orderModel.deleteOrder(req.params.id);

    if (!success) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.status(204).send();
};

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};