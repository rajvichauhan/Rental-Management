const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get all orders (admin/staff) or user's orders (customers) - MOCK VERSION
const getAllOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { user } = req;

  // Mock orders data
  const mockOrders = [
    {
      id: 'order_1',
      orderNumber: 'ORD-001',
      status: 'pending',
      totalAmount: 100,
      createdAt: new Date().toISOString(),
      customerId: user._id || 'mock_customer'
    },
    {
      id: 'order_2',
      orderNumber: 'ORD-002',
      status: 'completed',
      totalAmount: 250,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      customerId: user._id || 'mock_customer'
    }
  ];

  res.status(200).json({
    status: 'success',
    data: {
      orders: mockOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockOrders.length
      }
    }
  });
});

// Get single order by ID - MOCK VERSION
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock order data
  const mockOrder = {
    id: id,
    orderNumber: 'ORD-' + Date.now(),
    status: 'pending',
    totalAmount: 150,
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: 'mock_product_1',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100
      }
    ]
  };

  res.status(200).json({
    status: 'success',
    data: mockOrder
  });
});

// Create new order - NO VALIDATION, just create the order (MOCK VERSION)
const createOrder = catchAsync(async (req, res) => {
  const { user } = req;

  // Get all data from request body, use defaults if missing
  const {
    items = [],
    billingAddress = {},
    deliveryAddress = {},
    deliveryMethod = 'home_delivery',
    paymentMethod = 'cod',
    subtotal = 0,
    taxAmount = 0,
    deliveryCharge = 0,
    discountAmount = 0,
    totalAmount = 0,
    appliedCoupon = null,
    notes = ''
  } = req.body;

  // Generate mock order data
  const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const orderNumber = 'ORD-' + Date.now();

  logger.info(`Mock order created: ${orderId} by user: ${user?._id || 'unknown'}`);
  logger.info(`Order data received:`, {
    itemsCount: items.length,
    totalAmount,
    deliveryMethod,
    paymentMethod
  });

  // Always return success - no database required
  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: {
      id: orderId,
      orderNumber: orderNumber,
      status: 'pending',
      totalAmount: totalAmount || 0,
      subtotal: subtotal || 0,
      taxAmount: taxAmount || 0,
      deliveryCharge: deliveryCharge || 0,
      discountAmount: discountAmount || 0,
      deliveryMethod: deliveryMethod || 'home_delivery',
      paymentMethod: paymentMethod || 'cod',
      itemsCount: items.length,
      createdAt: new Date().toISOString(),
      billingAddress,
      deliveryAddress: deliveryAddress.street ? deliveryAddress : billingAddress,
      appliedCoupon,
      notes: notes || `Mock order created. Items: ${items.length}, Total: ${totalAmount}`
    }
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
