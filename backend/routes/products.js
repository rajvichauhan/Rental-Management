const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
} = require('../controllers/productsController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Validation rules for product creation/update
const productValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Product category is required'),
  
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  
  body('rentalPricing.daily.standard')
    .isNumeric()
    .withMessage('Daily standard price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Daily standard price must be positive'),
  
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
];

// @route   GET /api/products
// @desc    Get all products for vendor
// @access  Private (Vendor only)
router.get('/', auth, roleAuth(['vendor']), getProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Private (Vendor only)
router.get('/:id', auth, roleAuth(['vendor']), getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor only)
router.post('/', auth, roleAuth(['vendor']), productValidation, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor only)
router.put('/:id', auth, roleAuth(['vendor']), productValidation, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor only)
router.delete('/:id', auth, roleAuth(['vendor']), deleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Vendor only)
router.patch('/:id/stock', auth, roleAuth(['vendor']), [
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
], updateProductStock);

module.exports = router;
