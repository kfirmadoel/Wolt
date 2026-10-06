// services/orderService.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getAll = async () => {
    return await Order.find({});
};

const getById = async (id) => {
    return await Order.findOne({ id });
};

const getByUserId = async (userId) => {
    return await Order.find({ userId });
};

const calculateTotalPrice = async (items, restaurantId) => {
    if (!Array.isArray(items) || items.length === 0) {
        return 0;
    }

    let total = 0;
    for (const item of items) {
        const productId = item.productId ?? item.id;
        const product = await Product.findOne({ id: productId, restaurantId });
        if (!product) continue;

        const price = Number(product.price);
        if (!Number.isFinite(price)) continue;

        const quantity = Number(item.quantity) || 1;
        total += price * quantity;
    }
    return total;
};

const create = async (data) => {
    const newId = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const totalPrice = await calculateTotalPrice(data.items, data.restaurantId);

    const order = new Order({
        id: newId,
        userId: data.userId,
        restaurantId: data.restaurantId,
        items: data.items,
        totalPrice,
        status: 'pending'
    });
    await order.save();
    return order;
};

const update = async (id, data) => {
    const order = await Order.findOne({ id });
    if (!order) return null;

    const updateFields = {};
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.items !== undefined) {
        updateFields.items = data.items;
        updateFields.totalPrice = await calculateTotalPrice(data.items, order.restaurantId);
    }

    return await Order.findOneAndUpdate({ id }, updateFields, { new: true, runValidators: true });
};

const deleteOrder = async (id) => {
    return await Order.findOneAndDelete({ id });
};

module.exports = {
    getAll,
    getByUserId,
    getById,
    create,
    update,
    deleteOrder
};