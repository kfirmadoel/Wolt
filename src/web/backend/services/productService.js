// services/productService.js
const Product = require('../models/productModel');
const Restaurant = require('../models/restaurantModel');

const getById = async (pId, restaurantId) => {
    return await Product.findOne({ id: pId, restaurantId });
};

const getAllByRestaurant = async (restaurantId) => {
    return await Product.find({ restaurantId });
};

const create = async (restaurantId, data) => {
    const newId = 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const product = new Product({
        id: newId,
        restaurantId,
        name: data.name.trim(),
        description: data.description || "",
        category: data.category || "",
        picture: data.picture || "",
        price: Number(data.price)
    });
    await product.save();
    if (!await Restaurant.findOne({ id: restaurantId })) {
        await Product.deleteOne({ id: product.id, restaurantId });
        return null;
    }
    return product;
};

const updateProduct = async (pId, restaurantId, data) => {
    const update = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.description !== undefined) update.description = data.description;
    if (data.category !== undefined) update.category = data.category;
    if (data.picture !== undefined) update.picture = data.picture;
    if (data.price !== undefined) update.price = Number(data.price);

    return await Product.findOneAndUpdate(
        { id: pId, restaurantId },
        update,
        { new: true, runValidators: true }
    );
};

const deleteProduct = async (pId, restaurantId) => {
    return await Product.findOneAndDelete({ id: pId, restaurantId });
};

module.exports = {
    getById,
    getAllByRestaurant,
    create,
    updateProduct,
    deleteProduct
};
