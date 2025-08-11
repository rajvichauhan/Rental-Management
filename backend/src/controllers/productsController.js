const Product = require('../models/Product');
const Category = require('../models/Category');
const logger = require('../utils/logger');

/**
 * Get all products with filtering, sorting, and pagination
 */
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      minPrice,
      maxPrice,
      condition,
      isActive = true
    } = req.query;

    // Build filter object
    const filter = { isActive };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (condition) {
      filter.condition = condition;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const products = await Product.find(filter)
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter by price if specified (from pricing rules)
    let filteredProducts = products;
    if (minPrice || maxPrice) {
      filteredProducts = products.filter(product => {
        const dailyPricing = product.pricingRules.find(rule => rule.pricingType === 'daily' && rule.isActive);
        if (!dailyPricing) return true;
        
        const price = dailyPricing.basePrice;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * Get a single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * Search products
 */
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
    .populate('category', 'name')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

/**
 * Get featured products
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    // For now, just return random products. In future, add a 'featured' field
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: parseInt(limit) } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      }
    ]);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    logger.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  searchProducts,
  getFeaturedProducts
};
