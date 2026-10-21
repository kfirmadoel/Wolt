// controllers/productsController.js
const productService = require('../services/productService');
const tcpClient = require('../services/tcpClient');

const validateProduct = (data, partial = false) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return "Request body must be an object";
    }
    if ((!partial || data.name !== undefined) && (typeof data.name !== 'string' || !data.name.trim())) {
        return "Name is required";
    }
    if ((!partial || data.price !== undefined) && (!Number.isFinite(data.price) || data.price <= 0)) {
        return "Price must be a number greater than 0";
    }
    if (data.description !== undefined && typeof data.description !== 'string') {
        return "Description must be a string";
    }
    if (data.category !== undefined && typeof data.category !== 'string') {
        return "Category must be a string";
    }
    if (data.picture !== undefined && typeof data.picture !== 'string') {
        return "Picture must be a string";
    }
    return null;
};

const getAllProducts = async (req, res) => {
    const products = await productService.getAllByRestaurant(req.params.id);
    res.status(200).json(products);
};

const createProduct = async (req, res) => {
    const error = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const newProduct = await productService.create(req.params.id, req.body);
    if (!newProduct) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
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
    const error = validateProduct(req.body, true);
    if (error) {
        return res.status(400).json({ error });
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
