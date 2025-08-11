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

// Admin/Staff routes
router.get('/', restrictTo('admin', 'staff'), ordersController.getAllOrders);
router.patch('/:id/status', restrictTo('admin', 'staff'), ordersController.updateOrderStatus); // Remove validation

module.exports = router;
