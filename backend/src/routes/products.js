const express = require('express');
const { body, query, param } = require('express-validator');
const productController = require('../controllers/productController');
const { verifyToken, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('categoryId')
    .isUUID()
    .withMessage('Valid category ID is required'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must not exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must not exceed 100 characters'),
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Condition must be one of: excellent, good, fair, poor'),
  body('replacementValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Replacement value must be a positive number'),
  body('requiresDeposit')
    .optional()
    .isBoolean()
    .withMessage('Requires deposit must be a boolean'),
  body('depositAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a positive number'),
  body('minRentalPeriod')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum rental period must be at least 1 hour'),
  body('maxRentalPeriod')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum rental period must be at least 1 hour'),
  body('advanceBookingDays')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Advance booking days must be a non-negative integer'),
  body('lateFeePerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee per day must be a positive number')
];

const updateProductValidation = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  ...createProductValidation.map(validation => validation.optional())
];

const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isUUID()
    .withMessage('Category must be a valid UUID'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'created_at', 'popularity'])
    .withMessage('Sort by must be one of: name, price, created_at, popularity'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const availabilityValidation = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// Public routes
router.get('/', productQueryValidation, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories/:categoryId', productQueryValidation, productController.getProductsByCategory);
router.get('/:id', param('id').isUUID(), productController.getProduct);
router.get('/:id/availability', availabilityValidation, productController.checkAvailability);
router.get('/:id/pricing', param('id').isUUID(), productController.getProductPricing);

// Protected routes - require authentication
router.use(verifyToken);

// Customer routes
router.get('/:id/similar', param('id').isUUID(), productController.getSimilarProducts);

// Admin/Staff only routes
router.use(restrictTo('admin', 'staff'));

router.post('/', createProductValidation, productController.createProduct);
router.patch('/:id', updateProductValidation, productController.updateProduct);
router.delete('/:id', param('id').isUUID(), productController.deleteProduct);

// Inventory management
router.get('/:id/inventory', param('id').isUUID(), productController.getProductInventory);
router.post('/:id/inventory', productController.addInventoryItem);
router.patch('/:id/inventory/:inventoryId', productController.updateInventoryItem);
router.delete('/:id/inventory/:inventoryId', productController.removeInventoryItem);

// Pricing management
router.post('/:id/pricing', productController.addPricingRule);
router.patch('/:id/pricing/:ruleId', productController.updatePricingRule);
router.delete('/:id/pricing/:ruleId', productController.deletePricingRule);

// Bulk operations
router.post('/bulk/update', productController.bulkUpdateProducts);
router.post('/bulk/delete', productController.bulkDeleteProducts);

// Analytics
router.get('/:id/analytics', param('id').isUUID(), productController.getProductAnalytics);

module.exports = router;
