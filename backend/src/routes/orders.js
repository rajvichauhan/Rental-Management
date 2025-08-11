const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { verifyToken, restrictTo } = require('../middleware/auth');

// Validation middleware
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.rentalStart')
    .optional()
    .isISO8601()
    .withMessage('Rental start date must be a valid ISO 8601 date'),
  body('items.*.rentalEnd')
    .optional()
    .isISO8601()
    .withMessage('Rental end date must be a valid ISO 8601 date'),
  body('billingAddress')
    .optional()
    .isObject()
    .withMessage('Billing address must be an object'),
  body('deliveryAddress')
    .optional()
    .isObject()
    .withMessage('Delivery address must be an object'),
  body('totalAmount')
    .optional()
    .isNumeric()
    .withMessage('Total amount must be a number')
];

const updateOrderValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('pickup_address').optional().isObject(),
  body('return_address').optional().isObject(),
  body('notes').optional().isString()
];

const statusUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])
    .withMessage('Invalid status value')
];

// Public routes (require authentication)
router.use(verifyToken);

// Customer routes
router.get('/my-orders', ordersController.getMyOrders);
router.get('/:id', param('id').isMongoId(), ordersController.getOrderById);
router.post('/', createOrderValidation, ordersController.createOrder);
router.patch('/:id', updateOrderValidation, ordersController.updateOrder);

// Admin/Staff routes
router.get('/', restrictTo('admin', 'staff'), ordersController.getAllOrders);
router.patch('/:id/status', restrictTo('admin', 'staff'), statusUpdateValidation, ordersController.updateOrderStatus);

module.exports = router;
