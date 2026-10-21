const express = require ('express');
const router = express.Router({mergeParams: true});
const productsController = require ('../controllers/productsController');
const middleware = require ('../controllers/middlewares');

router.use(middleware.checkRestaurant);

const requireOwnerAccess = [
    middleware.requireAuth,
    middleware.requireRole('restaurant_owner'),
    middleware.checkOwnership
];

router.route('/')
    .get(productsController.getAllProducts)
    .post(...requireOwnerAccess, productsController.createProduct);

router.route('/:pId')
    .get(middleware.optionalAuth, productsController.getProductById)
    .patch(...requireOwnerAccess, productsController.updateProduct)
    .delete(...requireOwnerAccess, productsController.deleteProduct);

module.exports = router;