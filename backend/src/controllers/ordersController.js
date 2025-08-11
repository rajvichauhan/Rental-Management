const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get all orders (admin/staff) or user's orders (customers)
const getAllOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const { user } = req;

  // Build filter object
  const filter = {};

  // If customer, only show their orders
  if (user.role === 'customer') {
    filter.customerId = user._id;
  }

  // Add status filter
  if (status) {
    filter.status = status;
  }

  // Add date range filter
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const orders = await Order.find(filter)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name sku images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    }
  });
});

// Get single order by ID
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  // Build filter
  const filter = { _id: id };

  // If customer, ensure they can only access their own orders
  if (user.role === 'customer') {
    filter.customerId = user._id;
  }

  const order = await Order.findOne(filter)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name sku images')
    .lean();

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: order
  });
});

// Create new order
const createOrder = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, errors.array());
  }

  const { user } = req;
  const {
    items = [],
    billingAddress = {},
    deliveryAddress = {},
    deliveryMethod = 'home_delivery',
    paymentMethod = 'card',
    subtotal = 0,
    taxAmount = 0,
    deliveryCharge = 0,
    discountAmount = 0,
    totalAmount = 0,
    appliedCoupon,
    notes
  } = req.body;

  // Calculate rental dates from first item (assuming all items have same dates)
  const rentalStart = items[0]?.rentalStart || new Date();
  const rentalEnd = items[0]?.rentalEnd || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 1 day

  // Prepare order items with calculated totals
  const orderItems = items.map(item => ({
    productId: item.productId,
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
    rentalStart: item.rentalStart || rentalStart,
    rentalEnd: item.rentalEnd || rentalEnd,
    pricingType: 'daily'
  }));

  // Create order
  const orderData = {
    customerId: user._id,
    status: 'pending',
    items: orderItems,
    billingAddress,
    deliveryAddress: deliveryAddress.street ? deliveryAddress : billingAddress,
    deliveryMethod,
    paymentMethod,
    rentalStart,
    rentalEnd,
    subtotal: subtotal || 0,
    taxAmount: taxAmount || 0,
    deliveryCharge: deliveryCharge || 0,
    discountAmount: discountAmount || 0,
    totalAmount: totalAmount || 0,
    appliedCoupon,
    notes: notes || `Delivery Method: ${deliveryMethod}, Payment Method: ${paymentMethod}${appliedCoupon ? `, Coupon: ${appliedCoupon}` : ''}`
  };

  const order = new Order(orderData);
  await order.save();

  // Populate the order for response
  await order.populate('customerId', 'name email phone');
  await order.populate('items.productId', 'name sku images');

  logger.info(`Order created: ${order._id} by user: ${user._id}`);

  res.status(201).json({
    status: 'success',
    data: order
  });
});

// Update order
const updateOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const updateData = req.body;

  // Build filter
  const filter = { _id: id };

  // If customer, ensure they can only access their own orders
  if (user.role === 'customer') {
    filter.customerId = user._id;
  }

  // Find and update order
  const order = await Order.findOneAndUpdate(
    filter,
    updateData,
    { new: true, runValidators: true }
  ).populate('customerId', 'name email phone')
   .populate('items.productId', 'name sku images');

  if (!order) {
    throw new AppError('Order not found or access denied', 404);
  }

  res.status(200).json({
    status: 'success',
    data: order
  });
});

// Update order status (admin/staff only)
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('customerId', 'name email phone')
   .populate('items.productId', 'name sku images');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  logger.info(`Order status updated: ${id} to ${status}`);

  res.status(200).json({
    status: 'success',
    data: order
  });
});

// Get user's orders
const getMyOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { user } = req;

  // Build filter
  const filter = { customerId: user._id };

  if (status) {
    filter.status = status;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const orders = await Order.find(filter)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name sku images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    }
  });
});

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getMyOrders
};
