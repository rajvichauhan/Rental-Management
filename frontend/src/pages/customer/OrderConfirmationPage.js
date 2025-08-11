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
  FiPhone,
  FiPackage
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample confirmed order data - in real app, this would come from API
  const [order, setOrder] = useState({
    id: 'R0001',
    confirmationNumber: 'CONF-2024-001',
    status: 'confirmed',
    workflowStage: 'rental-order',
    vendor: {
      name: 'RentEasy Medical Equipment',
      email: 'vendor@renteasy.com',
      phone: '+1 (555) 987-6543',
      address: '789 Business Ave, City, State 12345'
    },
    customer: {
      name: user?.firstName + ' ' + user?.lastName || 'John Smith',
      email: user?.email || 'john.smith@email.com',
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

  const handlePrintOrder = () => {
    window.print();
  };

  const handleDownloadOrder = () => {
    // Create downloadable content for customer
    const orderData = {
      orderId: order.id,
      confirmationNumber: order.confirmationNumber,
      orderDate: order.rentalOrderDate,
      customer: order.customer,
      vendor: order.vendor,
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
  };

  const handleContactVendor = () => {
    window.location.href = `mailto:${order.vendor.email}`;
  };

  useEffect(() => {
    // Simulate API call to fetch order details
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // In real app, fetch order from API using id parameter
        // Ensure customer can only access their own orders
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
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
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Order Confirmation</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm">{user?.firstName || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <FiCheck className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-green-400 mb-2">Order Confirmed!</h2>
                <p className="text-green-300">
                  Your rental order has been confirmed. You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>

          {/* Order Header */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Order #{order.id}</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrintOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center"
                >
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={handleDownloadOrder}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            {/* Order Details */}
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

          {/* Order Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rental Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Rental Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rental Period:</label>
                    <p className="text-white">{order.rentalPeriod}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration:</label>
                    <p className="text-white">{order.rentalDuration}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date:</label>
                    <p className="text-white">{new Date(order.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date:</label>
                    <p className="text-white">{new Date(order.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiPackage className="w-5 h-5 mr-2" />
                  Rental Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quantity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Unit Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderLines.map((line) => (
                        <tr key={line.id} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-white">{line.product}</td>
                          <td className="py-3 px-4 text-white">{line.quantity}</td>
                          <td className="py-3 px-4 text-white">${line.unitPrice}</td>
                          <td className="py-3 px-4 text-white font-medium">${line.subTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Delivery */}
            <div className="space-y-6">
              {/* Vendor Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2" />
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company:</label>
                    <p className="text-white">{order.vendor.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email:</label>
                    <p className="text-white">{order.vendor.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone:</label>
                    <p className="text-white">{order.vendor.phone}</p>
                  </div>
                  <button
                    onClick={handleContactVendor}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center mt-4"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Contact Vendor
                  </button>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Address:</label>
                    <p className="text-white text-sm">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Date:</label>
                    <p className="text-white">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pickup Date:</label>
                    <p className="text-white">{new Date(order.pickupDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
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
                  <div className="mt-4">
                    <span className="text-gray-400 text-sm">Payment Status: </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      <FiClock className="w-3 h-3 mr-1" />
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
