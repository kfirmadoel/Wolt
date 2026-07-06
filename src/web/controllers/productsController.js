// controllers/productsController.js
const productModel = require('../models/productModel');

// The function will return the all products in the restaurant.
const getAllProducts = (req, res) => {
    const products = productModel.getAllByRestaurant(req.params.id);
    res.status(200).json(products);
};

// The function will create new product realted to the reataurant.
const createProduct = (req, res) => {
    if (!req.body.name || !req.body.price || req.body.price <= 0) {
        return res.status(400).json({ error: "Name and a valid price greater than 0 are required" });
    }

    const newProduct = productModel.create(req.params.id, req.body);
    
    res.status(201).location(`/api/restaurants/${req.params.id}/products/${newProduct.id}`).send();
};

// The function will return the specific product, if there is user connected it will connect the c++.
const getProductById = (req, res) => {
    const product = productModel.getById(req.params.pId, req.params.id);

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    if (req.userId){
        //TODO
        //call dev 3 function
    }

    res.status(200).json(product);
};

// update product details, notice that if giving "" as name or non positive price it will return wrong.
const updateProduct = (req, res) => {
    if (req.body.name !== undefined && req.body.name.trim() === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
    }
    if (req.body.price !== undefined && req.body.price <= 0) {
        return res.status(400).json({ error: "Price must be greater than 0" });
    }  

    const product = productModel.updateProduct( req.params.pId, req.params.id, req.body);
    
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
};

const deleteProduct = (req, res) => {
    const success = productModel.deleteProduct(req.params.pId, req.params.id);
    
    if (!success) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
};

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};