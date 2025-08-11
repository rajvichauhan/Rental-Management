const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { verifyToken, restrictTo } = require('../middleware/auth');

// Public routes (require authentication)
router.use(verifyToken);

// Customer routes
router.get('/my-orders', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderById); // Remove validation
router.post('/', ordersController.createOrder); // Remove all validation
router.patch('/:id', ordersController.updateOrder); // Remove validation

// Vendor routes
router.get('/', restrictTo('vendor'), ordersController.getAllOrders);
router.patch('/:id/status', restrictTo('vendor'), ordersController.updateOrderStatus); // Remove validation

module.exports = router;
