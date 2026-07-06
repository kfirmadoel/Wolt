const express = require ('express');
const router = express.Router({mergeParams: true});
const productsController = require ('../controllers/productsController');
const middleware = require ('../controllers/middlewares');

// middleware that check if the restaurant exist.
router.use(middleware.checkRestaurant);

router.route('/')
    .get(productsController.getAllProducts)
    .post(productsController.createProduct);

router.route('/:pId')
    .get(middleware.verifyUser, productsController.getProductById)
    .patch(productsController.updateProduct)
    .delete(productsController.deleteProduct);

module.exports = router;