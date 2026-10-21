// services/orderService.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Restaurant = require('../models/restaurantModel');

const getAll = async () => {
    return await Order.find({});
};

const getById = async (id) => {
    return await Order.findOne({ id });
};

const getByUserId = async (userId) => {
    return await Order.find({ userId });
};

const orderError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const prepareItems = async (items, restaurantId) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw orderError("Order must contain at least one item");
    }

    const snapshots = [];
    let totalPrice = 0;
    for (const item of items) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            throw orderError("Each order item must be an object");
        }
        const productId = item.productId !== undefined ? item.productId : item.id;
        if (typeof productId !== 'string' || !productId.trim() ||
            !Number.isInteger(item.quantity) || item.quantity < 1) {
            throw orderError("Each order item needs a productId and a positive integer quantity");
        }
        const product = await Product.findOne({ id: productId.trim(), restaurantId });
        if (!product) {
            throw orderError("An order item does not belong to this restaurant");
        }

        const price = Number(product.price);
        if (!Number.isFinite(price) || price <= 0) {
            throw orderError("An order item has an invalid price");
        }

        totalPrice += price * item.quantity;
        snapshots.push({
            productId: product.id,
            name: product.name,
            description: product.description || "",
            picture: product.picture || "",
            category: product.category || "",
            price,
            quantity: item.quantity
        });
    }
    if (!Number.isFinite(totalPrice)) {
        throw orderError("Order total must be a finite number");
    }
    return { items: snapshots, totalPrice };
};

const create = async (data) => {
    const restaurant = await Restaurant.findOne({ id: data.restaurantId });
    if (!restaurant) throw orderError("Restaurant not found", 404);
    const prepared = await prepareItems(data.items, data.restaurantId);
    const newId = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const order = new Order({
        id: newId,
        userId: data.userId,
        restaurantId: data.restaurantId,
        restaurantName: restaurant.name,
        items: prepared.items,
        totalPrice: prepared.totalPrice,
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
        const prepared = await prepareItems(data.items, order.restaurantId);
        updateFields.items = prepared.items;
        updateFields.totalPrice = prepared.totalPrice;
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
