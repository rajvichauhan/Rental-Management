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

// Update order - MOCK VERSION
const updateOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  const mockOrder = {
    id: id,
    orderNumber: 'ORD-' + Date.now(),
    status: 'updated',
    totalAmount: 150,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({
    status: 'success',
    data: mockOrder
  });
});

// Update order status (admin/staff only) - MOCK VERSION
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const mockOrder = {
    id: id,
    orderNumber: 'ORD-' + Date.now(),
    status: status || 'updated',
    totalAmount: 150,
    updatedAt: new Date().toISOString()
  };

  logger.info(`Mock order status updated: ${id} to ${status}`);

  res.status(200).json({
    status: 'success',
    data: mockOrder
  });
});

// Get user's orders - MOCK VERSION
const getMyOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const mockOrders = [
    {
      id: 'my_order_1',
      orderNumber: 'ORD-001',
      status: 'pending',
      totalAmount: 100,
      createdAt: new Date().toISOString()
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

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getMyOrders
};
