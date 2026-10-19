// controllers/ordersController.js
const orderService = require('../services/orderService');

const getAllOrders = async (req, res) => {
    res.status(200).json(await orderService.getByUserId(req.userId));
};

const createOrder = async (req, res) => {
    const { restaurantId, items } = req.body;

    if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const newOrder = await orderService.create({ userId: req.userId, restaurantId, items });
    res.status(201).location(`/api/orders/${newOrder.id}`).send();
};

const getOrderById = async (req, res) => {
    const order = await orderService.getById(req.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
};

const updateOrder = async (req, res) => {
    if (req.body.status !== undefined && req.body.status.trim() === "") {
        return res.status(400).json({ error: "Status cannot be empty" });
    }

    const updatedOrder = await orderService.update(req.params.id, req.body);
    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.status(204).send();
};

const deleteOrder = async (req, res) => {
    const success = await orderService.deleteOrder(req.params.id);
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