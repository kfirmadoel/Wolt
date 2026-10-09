const db = require('../database');

const getById = (pId, restaurantId) => {
    return db.getProductByRestaurantAndId(pId, restaurantId);
};

const getAllByRestaurant = (restaurantId) => {
    return db.getProductsByRestaurantId(restaurantId);
};

const create = (restaurantId, data) => {
    const product = {
        id: 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        restaurantId,
        name: data.name,
        description: data.description || "",
        category: typeof data.category === 'string' ? data.category.trim() : "",
        picture: data.picture || data.image || "",
        // Ensure price is stored as a number (accept numeric strings)
        price: Number(data.price),
    };
    db.addProduct(product);
    return product;
};

const updateProduct = (pId, restaurantId, data) => {
    const product = db.getProductByRestaurantAndId(pId, restaurantId);
    if (!product) return null;
    
    product.name = data.name ?? product.name;
    product.description = data.description ?? product.description;
    product.price = data.price !== undefined ? Number(data.price) : product.price;
    product.category = data.category ?? product.category;
    product.picture = data.picture ?? data.image ?? product.picture;
    
    return product;
}

const deleteProduct = (pId, restaurantId) => {
    const product = db.getProductByRestaurantAndId(pId, restaurantId);
    if (!product) return null;
    
    return db.deleteProduct(pId);
};

module.exports = {
    getById,
    getAllByRestaurant,
    create,
    updateProduct,
    deleteProduct
};