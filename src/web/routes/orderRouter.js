const express = require ('express');
const router = express.Router();
const ordersController = require ('../controllers/ordersController');
const middleware = require ('../controllers/middlewares');

// middleware that check if the order exist.
router.use(middleware.verifyUser);

router.route('/')
    .get(ordersController.getAllOrders)
    .post(ordersController.createOrder);

router.route('/:id')
    .get(ordersController.getOrderById)
    .patch(ordersController.updateOrder)
    .delete(ordersController.deleteOrder);

module.exports = router;