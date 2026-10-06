// controllers/productsController.js
const productService = require('../services/productService');
const tcpClient = require('../services/tcpClient');

const getAllProducts = async (req, res) => {
    const products = await productService.getAllByRestaurant(req.params.id);
    res.status(200).json(products);
};

const createProduct = async (req, res) => {
    if (!req.body.name || !req.body.price || req.body.price <= 0) {
        return res.status(400).json({ error: "Name and a valid price greater than 0 are required" });
    }

    const newProduct = await productService.create(req.params.id, req.body);
    res.status(201).location(`/api/restaurants/${req.params.id}/products/${newProduct.id}`).send();
};

const getProductById = async (req, res) => {
    const product = await productService.getById(req.params.pId, req.params.id);

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    if (req.userId) {
        try {
            tcpClient.recordProductView(req.userId, req.params.pId).catch(error => {
                console.error(`Warning: Failed to record product view with C++ server: ${error.message}`);
            });
        } catch (error) {
            console.error(`Error initiating product view recording: ${error.message}`);
        }
    }

    res.status(200).json(product);
};

const updateProduct = async (req, res) => {
    if (req.body.name !== undefined && req.body.name.trim() === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
    }
    if (req.body.price !== undefined && req.body.price <= 0) {
        return res.status(400).json({ error: "Price must be greater than 0" });
    }

    const product = await productService.updateProduct(req.params.pId, req.params.id, req.body);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
};

const deleteProduct = async (req, res) => {
    const success = await productService.deleteProduct(req.params.pId, req.params.id);
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