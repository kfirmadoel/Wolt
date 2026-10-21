// controllers/ordersController.js
const orderService = require('../services/orderService');

const sendError = (res, error) => {
    if (error.status) {
        return res.status(error.status).json({ error: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ error: "Invalid order details" });
    }
    return res.status(500).json({ error: "Could not process the order. Please try again." });
};

const getOwnedOrder = async (req, res) => {
    const order = await orderService.getById(req.params.id);
    if (!order) {
        res.status(404).json({ error: "Order not found" });
        return null;
    }
    if (order.userId !== req.userId) {
        res.status(403).json({ error: "You can only access your own orders" });
        return null;
    }
    return order;
};

const getAllOrders = async (req, res) => {
    try {
        res.status(200).json(await orderService.getByUserId(req.userId));
    } catch (error) {
        sendError(res, error);
    }
};

const createOrder = async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: "Request body must be an object" });
    }
    const { restaurantId, items } = req.body;
    if (typeof restaurantId !== 'string' || !restaurantId.trim()) {
        return res.status(400).json({ error: "restaurantId is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
    }

    try {
        const newOrder = await orderService.create({ userId: req.userId, restaurantId: restaurantId.trim(), items });
        res.status(201).location(`/api/orders/${newOrder.id}`).json(newOrder);
    } catch (error) {
        sendError(res, error);
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await getOwnedOrder(req, res);
        if (order) res.status(200).json(order);
    } catch (error) {
        sendError(res, error);
    }
};

const updateOrder = async (req, res) => {
    try {
        const order = await getOwnedOrder(req, res);
        if (!order) return;
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ error: "Request body must be an object" });
        }
        const update = {};
        if (req.body.status !== undefined) {
            if (typeof req.body.status !== 'string' || !['pending', 'completed', 'cancelled'].includes(req.body.status.trim())) {
                return res.status(400).json({ error: "Status must be pending, completed or cancelled" });
            }
            update.status = req.body.status.trim();
        }
        if (req.body.items !== undefined) update.items = req.body.items;
        if (update.status === undefined && update.items === undefined) {
            return res.status(400).json({ error: "Provide status or items to update" });
        }

        const updatedOrder = await orderService.update(order.id, update);
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await getOwnedOrder(req, res);
        if (!order) return;
        const deletedOrder = await orderService.deleteOrder(order.id);
        if (!deletedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};
