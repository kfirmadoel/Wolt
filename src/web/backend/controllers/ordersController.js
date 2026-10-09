// src/web/controllers/ordersController.js
const orderModel = require('../models/orderModel');
const restaurantModel = require('../models/restaurantModel');
const productModel = require('../models/productModel');

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

    if (!restaurantModel.getById(restaurantId)) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    for (const item of items) {
        const productId = item?.productId ?? item?.id;
        const quantity = Number(item?.quantity);
        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Each order item needs a productId and a positive integer quantity" });
        }
        if (!productModel.getById(productId, restaurantId)) {
            return res.status(400).json({ error: "An order item does not belong to this restaurant" });
        }
    }

    const newOrder = orderModel.create({ userId: req.userId, restaurantId, items });

    res.status(201).location(`/api/orders/${newOrder.id}`).json(newOrder);
};

const getOrderById = (req, res) => {
    const order = orderModel.getById(req.params.id);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
        return res.status(403).json({ error: "You can only access your own orders" });
    }

    res.status(200).json(order);
};

const updateOrder = (req, res) => {
    if (req.body.status !== undefined && req.body.status.trim() === "") {
        return res.status(400).json({ error: "Status cannot be empty" });
    }

    const order = orderModel.getById(req.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
        return res.status(403).json({ error: "You can only update your own orders" });
    }

    const updatedOrder = orderModel.update(req.params.id, req.body);

    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.status(204).send();
};

const deleteOrder = (req, res) => {
    const order = orderModel.getById(req.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
        return res.status(403).json({ error: "You can only delete your own orders" });
    }

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