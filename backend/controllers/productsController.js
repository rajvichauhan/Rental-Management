const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Sample product data for development
const sampleProducts = [
  {
    id: 'P001',
    name: 'Premium Wheelchair',
    description: 'High-quality manual wheelchair with ergonomic design and lightweight aluminum frame. Perfect for both indoor and outdoor use.',
    category: 'Mobility Equipment',
    subcategory: 'Wheelchairs',
    sku: 'WC-PREM-001',
    brand: 'MediCare Pro',
    model: 'Comfort Plus 2024',
    weight: '15 kg',
    dimensions: '65cm x 60cm x 90cm',
    material: 'Aluminum Frame with Fabric Seat',
    color: 'Navy Blue',
    features: [
      'Lightweight aluminum frame',
      'Ergonomic armrests',
      'Quick-release wheels',
      'Adjustable footrests',
      'Anti-tip wheels',
      'Foldable design'
    ],
    specifications: {
      'Seat Width': '45cm',
      'Seat Depth': '40cm',
      'Weight Capacity': '120kg',
      'Wheel Size': '24" rear, 8" front',
      'Frame Material': 'Aluminum',
      'Warranty': '2 years'
    },
    availability: 'In Stock',
    stockQuantity: 15,
    condition: 'Excellent',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    images: [
      '/images/wheelchair-1.jpg',
      '/images/wheelchair-2.jpg',
      '/images/wheelchair-3.jpg'
    ],
    rentalPricing: {
      daily: { standard: 50, premium: 75, bulk: 40 },
      weekly: { standard: 300, premium: 450, bulk: 240 },
      monthly: { standard: 1000, premium: 1500, bulk: 800 }
    },
    reservationCharges: {
      extraHour: 25,
      extraDay: 60,
      lateFee: 30
    },
    tags: ['mobility', 'wheelchair', 'medical', 'aluminum'],
    rating: 4.8,
    reviewCount: 24,
    vendorId: 'vendor1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 'P002',
    name: 'Hospital Bed - Electric',
    description: 'Fully electric hospital bed with adjustable height, head, and foot sections. Includes side rails and mattress.',
    category: 'Medical Devices',
    subcategory: 'Hospital Beds',
    sku: 'HB-ELEC-002',
    brand: 'MedTech Solutions',
    model: 'ElectricCare Pro',
    weight: '85 kg',
    dimensions: '210cm x 90cm x 50-80cm',
    material: 'Steel Frame with Medical Grade Mattress',
    color: 'White',
    features: [
      'Electric height adjustment',
      'Head and foot elevation',
      'Side rails included',
      'Medical grade mattress',
      'Emergency lowering',
      'Lockable wheels'
    ],
    specifications: {
      'Bed Length': '210cm',
      'Bed Width': '90cm',
      'Height Range': '50-80cm',
      'Weight Capacity': '200kg',
      'Power': '220V AC',
      'Warranty': '3 years'
    },
    availability: 'In Stock',
    stockQuantity: 8,
    condition: 'Good',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    images: [
      '/images/hospital-bed-1.jpg',
      '/images/hospital-bed-2.jpg'
    ],
    rentalPricing: {
      daily: { standard: 120, premium: 180, bulk: 100 },
      weekly: { standard: 750, premium: 1125, bulk: 625 },
      monthly: { standard: 2800, premium: 4200, bulk: 2400 }
    },
    reservationCharges: {
      extraHour: 50,
      extraDay: 150,
      lateFee: 75
    },
    tags: ['medical', 'hospital', 'bed', 'electric'],
    rating: 4.6,
    reviewCount: 18,
    vendorId: 'vendor1',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12'
  }
];

// @desc    Get all products for a vendor
// @route   GET /api/products
// @access  Private (Vendor)
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const vendorId = req.user.id;

    // For development, return sample data
    let filteredProducts = sampleProducts.filter(product => product.vendorId === vendorId);

    // Apply category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredProducts.length / limit),
        count: paginatedProducts.length,
        totalProducts: filteredProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private (Vendor)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // For development, find in sample data
    const product = sampleProducts.find(p => p.id === id && p.vendorId === vendorId);

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
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const productData = {
      ...req.body,
      vendorId,
      id: `P${Date.now()}`, // Generate unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, save to database
    console.log('Creating product:', productData);

    res.status(201).json({
      success: true,
      data: productData,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Find product in sample data
    const productIndex = sampleProducts.findIndex(p => p.id === id && p.vendorId === vendorId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    const updatedProduct = {
      ...sampleProducts[productIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // In a real app, update in database
    sampleProducts[productIndex] = updatedProduct;

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Find product in sample data
    const productIndex = sampleProducts.findIndex(p => p.id === id && p.vendorId === vendorId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // In a real app, delete from database
    sampleProducts.splice(productIndex, 1);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (Vendor)
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const vendorId = req.user.id;

    // Find product in sample data
    const productIndex = sampleProducts.findIndex(p => p.id === id && p.vendorId === vendorId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock
    sampleProducts[productIndex].stockQuantity = stockQuantity;
    sampleProducts[productIndex].updatedAt = new Date().toISOString();

    // Update availability based on stock
    if (stockQuantity === 0) {
      sampleProducts[productIndex].availability = 'Out of Stock';
    } else if (stockQuantity <= 5) {
      sampleProducts[productIndex].availability = 'Low Stock';
    } else {
      sampleProducts[productIndex].availability = 'In Stock';
    }

    res.json({
      success: true,
      data: sampleProducts[productIndex],
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
};
