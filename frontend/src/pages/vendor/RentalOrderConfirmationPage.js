import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiTruck,
  FiCheck,
  FiClock,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiMail,
  FiEdit
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const RentalOrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('order-lines');

  // Sample confirmed order data - in real app, this would come from API
  const [order, setOrder] = useState({
    id: 'R0001',
    confirmationNumber: 'CONF-2024-001',
    status: 'confirmed',
    workflowStage: 'rental-order',
    customer: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345'
    },
    invoiceAddress: '123 Main Street, City, State 12345',
    deliveryAddress: '456 Oak Avenue, City, State 12345',
    rentalPeriod: '7 days',
    rentalDuration: '1 week',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    expiration: '2024-01-14',
    rentalOrderDate: '2024-01-10',
    priceList: 'Standard',
    orderLines: [
      {
        id: 'P1234',
        product: 'Premium Wheelchair',
        quantity: 5,
        unitPrice: 200,
        tax: 0,
        subTotal: 1000
      }
    ],
    termsConditions: 'Standard rental terms and conditions apply.',
    untaxedTotal: 1000,
    tax: 0,
    total: 1000,
    paymentStatus: 'pending',
    deliveryMethod: 'delivery',
    deliveryDate: '2024-01-15',
    pickupDate: '2024-01-22',
    notes: 'Customer requested early morning delivery',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T15:30:00Z'
  });

  // Order workflow states
  const workflowStates = [
    { key: 'quotation', label: 'Quotation', icon: FiEdit, color: 'blue' },
    { key: 'quotation-sent', label: 'Quotation Sent', icon: FiClock, color: 'yellow' },
    { key: 'rental-order', label: 'Rental Order', icon: FiCheck, color: 'green' }
  ];

  const getCurrentStateIndex = () => {
    return workflowStates.findIndex(state => state.key === order.workflowStage);
  };

  const handlePrintOrder = () => {
    // Create a print-friendly version of the order
    const printContent = `
      <html>
        <head>
          <title>Order Confirmation - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .order-id { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .confirmation { font-size: 16px; color: #666; }
            .section { margin: 20px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
            .info-item { margin: 5px 0; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; background-color: #d4edda; color: #155724; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="order-id">Order ${order.id}</div>
            <div class="confirmation">Confirmation #: ${order.confirmationNumber}</div>
            <div class="confirmation">Order Date: ${new Date(order.rentalOrderDate).toLocaleDateString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-grid">
              <div>
                <div class="info-item"><span class="label">Name:</span> ${order.customer.name}</div>
                <div class="info-item"><span class="label">Email:</span> ${order.customer.email}</div>
                <div class="info-item"><span class="label">Phone:</span> ${order.customer.phone}</div>
              </div>
              <div>
                <div class="info-item"><span class="label">Invoice Address:</span> ${order.invoiceAddress}</div>
                <div class="info-item"><span class="label">Delivery Address:</span> ${order.deliveryAddress}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Rental Information</div>
            <div class="info-grid">
              <div>
                <div class="info-item"><span class="label">Rental Period:</span> ${order.rentalPeriod}</div>
                <div class="info-item"><span class="label">Start Date:</span> ${new Date(order.startDate).toLocaleDateString()}</div>
                <div class="info-item"><span class="label">End Date:</span> ${new Date(order.endDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div class="info-item"><span class="label">Delivery Date:</span> ${new Date(order.deliveryDate).toLocaleDateString()}</div>
                <div class="info-item"><span class="label">Pickup Date:</span> ${new Date(order.pickupDate).toLocaleDateString()}</div>
                <div class="info-item"><span class="label">Status:</span> <span class="status">Confirmed</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Details</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax</th>
                  <th>Sub Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderLines.map(line => `
                  <tr>
                    <td>${line.product}</td>
                    <td>${line.quantity}</td>
                    <td>$${line.unitPrice}</td>
                    <td>$${line.tax}</td>
                    <td>$${line.subTotal}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4">Total</td>
                  <td>$${order.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Terms & Conditions</div>
            <p>${order.termsConditions}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadOrder = () => {
    // Create downloadable content
    const orderData = {
      orderId: order.id,
      confirmationNumber: order.confirmationNumber,
      customer: order.customer,
      orderDate: order.rentalOrderDate,
      rentalPeriod: order.rentalPeriod,
      deliveryDate: order.deliveryDate,
      pickupDate: order.pickupDate,
      orderLines: order.orderLines,
      total: order.total,
      status: 'Confirmed'
    };

    const dataStr = JSON.stringify(orderData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `order-confirmation-${order.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Order confirmation downloaded');
  };

  const handleCreateDelivery = () => {
    console.log('Creating delivery order...');
    // Navigate to delivery creation or show modal
  };

  const handleContactCustomer = () => {
    window.location.href = `mailto:${order.customer.email}`;
  };

  const handleUpdateOrderState = (newState) => {
    setOrder(prev => ({
      ...prev,
      workflowStage: newState
    }));
    console.log('Order state updated to:', newState);
  };

  useEffect(() => {
    // Simulate API call to fetch order details
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // In real app, fetch order from API using id parameter
        // const response = await fetch(`/api/orders/${id}`);
        // const data = await response.json();
        // setOrder(data);
        
        // Simulate loading delay
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Order</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/vendor/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Rental Order Confirmation</h1>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              <Link
                to="/vendor-dashboard"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/vendor/rental"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Rental
              </Link>
              <Link
                to="/vendor/orders"
                className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
              >
                Order
              </Link>
              <Link
                to="/vendor/products"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Products
              </Link>
              <Link
                to="/vendor/reports"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Reporting
              </Link>
              <Link
                to="/vendor/settings"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Setting
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-sm">{user?.firstName || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Create Invoice Button */}
            <button 
              onClick={handlePrintOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
            
            <span className="text-gray-400 text-sm">Rental Orders</span>
            
            {/* Smart Delivery Button */}
            <button 
              onClick={handleCreateDelivery}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center"
              title="Smart button for delivery - when confirm 2 delivery order will be created 1 for pickup and 1 for return"
            >
              <FiTruck className="w-4 h-4 mr-2" />
              2 Delivery
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Info */}
            <span className="text-sm text-gray-400">1/30</span>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleDownloadOrder}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Download Order"
              >
                <FiDownload className="w-4 h-4" />
              </button>
              <button 
                onClick={handleContactCustomer}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Contact Customer"
              >
                <FiMail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Order Header */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">→{order.id}</h2>
              <div className="flex items-center space-x-4">
                {/* Order State Management */}
                <div className="flex items-center space-x-2">
                  {workflowStates.map((state, index) => {
                    const isActive = index <= getCurrentStateIndex();
                    const isCurrent = state.key === order.workflowStage;
                    const StateIcon = state.icon;
                    
                    return (
                      <div key={state.key} className="flex items-center">
                        <button
                          onClick={() => handleUpdateOrderState(state.key)}
                          className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                            isCurrent
                              ? `bg-${state.color}-600 text-white`
                              : isActive
                              ? `bg-${state.color}-600/20 text-${state.color}-400 hover:bg-${state.color}-600/30`
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          <StateIcon className="w-4 h-4 mr-2" />
                          {state.label}
                        </button>
                        {index < workflowStates.length - 1 && (
                          <div className={`w-8 h-0.5 mx-2 ${
                            index < getCurrentStateIndex() ? 'bg-green-400' : 'bg-gray-600'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirmation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Confirmation #:</span>
                <p className="text-white font-medium">{order.confirmationNumber}</p>
              </div>
              <div>
                <span className="text-gray-400">Order Date:</span>
                <p className="text-white">{new Date(order.rentalOrderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400 ml-2">
                  <FiCheck className="w-3 h-3 mr-1" />
                  Confirmed
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total Amount:</span>
                <p className="text-white font-bold">${order.total}</p>
              </div>
            </div>
          </div>

          {/* Order Details Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer & Rental Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Customer:</label>
                    <p className="text-white">{order.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email:</label>
                    <p className="text-white">{order.customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone:</label>
                    <p className="text-white">{order.customer.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expiration:</label>
                    <p className="text-white">{new Date(order.expiration).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Invoice Address:</label>
                    <p className="text-white">{order.invoiceAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Address:</label>
                    <p className="text-white">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Rental Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Rental Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rental Template:</label>
                    <p className="text-white">{order.priceList}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pricelist:</label>
                    <p className="text-white">{order.priceList}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rental Period:</label>
                    <p className="text-white">{order.rentalPeriod}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rental Duration:</label>
                    <p className="text-white">{order.rentalDuration}</p>
                  </div>
                </div>
              </div>

              {/* Order Lines Table */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Order Details</h3>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setActiveTab('order-lines')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'order-lines'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Order lines
                    </button>
                    <button
                      onClick={() => setActiveTab('order-details')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'order-details'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Order details
                    </button>
                    <button
                      onClick={() => setActiveTab('rental-notes')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'rental-notes'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Rental Notes
                    </button>
                  </div>
                </div>

                {/* Order Lines Content */}
                {activeTab === 'order-lines' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quantity</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Unit Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Tax</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Sub Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderLines.map((line) => (
                          <tr key={line.id} className="border-b border-gray-700">
                            <td className="py-3 px-4 text-white">{line.product}</td>
                            <td className="py-3 px-4 text-white">{line.quantity}</td>
                            <td className="py-3 px-4 text-white">${line.unitPrice}</td>
                            <td className="py-3 px-4 text-white">${line.tax}</td>
                            <td className="py-3 px-4 text-white font-medium">${line.subTotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Terms & Conditions */}
                {activeTab === 'order-details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions:</label>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-white text-sm">{order.termsConditions}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Payment Status:</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          <FiClock className="w-3 h-3 mr-1" />
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Method:</label>
                        <p className="text-white capitalize">{order.deliveryMethod}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rental Notes */}
                {activeTab === 'rental-notes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Special Notes:</label>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-white text-sm">{order.notes || 'No special notes for this order.'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Untaxed Total:</span>
                    <span className="text-white">${order.untaxedTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax:</span>
                    <span className="text-white">${order.tax}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-bold text-lg">${order.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiTruck className="w-5 h-5 mr-2" />
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Date:</label>
                    <p className="text-white">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pickup Date:</label>
                    <p className="text-white">{new Date(order.pickupDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Method:</label>
                    <p className="text-white capitalize">{order.deliveryMethod}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handlePrintOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiPrinter className="w-4 h-4 mr-2" />
                    Print Order
                  </button>
                  <button
                    onClick={handleDownloadOrder}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleContactCustomer}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Contact Customer
                  </button>
                  <button
                    onClick={handleCreateDelivery}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiTruck className="w-4 h-4 mr-2" />
                    Create Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalOrderConfirmationPage;
