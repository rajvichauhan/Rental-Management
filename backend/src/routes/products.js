const express = require("express");
const { query, param } = require("express-validator");
const productsController = require("../controllers/productsController");

const router = express.Router();

// Validation rules
const productQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ObjectId"),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  query("sortBy")
    .optional()
    .isIn(["name", "price", "createdAt", "popularity"])
    .withMessage("Sort by must be one of: name, price, createdAt, popularity"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

// Public routes
router.get("/", productQueryValidation, productsController.getProducts);
router.get("/categories", productsController.getCategories);
router.get("/featured", productsController.getFeaturedProducts);
router.get("/search", productsController.searchProducts);
router.get("/:id", param("id").isMongoId(), productsController.getProductById);

module.exports = router;
