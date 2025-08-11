import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiDownload,
  FiPrinter,
  FiEye,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';
import OrderDetailModal from '../../components/vendor/OrderDetailModal';
import OrderStatusBadge from '../../components/vendor/OrderStatusBadge';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const VendorOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Mock orders data for demonstration
  const mockOrders = [
    {
      id: 'R0001',
      orderNumber: 'R0001',
      customer: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      items: [{ productId: { name: 'Wheelchair' }, quantity: 1, unitPrice: 50 }],
      rentalStart: '2024-01-15',
      rentalEnd: '2024-01-20',
      status: 'confirmed',
      totalAmount: 250,
      createdAt: '2024-01-10T10:00:00Z',
      notes: 'Customer needs delivery by 9 AM'
    },
    {
      id: 'R0002',
      orderNumber: 'R0002',
      customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      items: [{ productId: { name: 'Hospital Bed' }, quantity: 1, unitPrice: 80 }],
      rentalStart: '2024-01-18',
      rentalEnd: '2024-01-25',
      status: 'pending',
      totalAmount: 560,
      createdAt: '2024-01-12T14:30:00Z',
      notes: ''
    },
    {
      id: 'R0003',
      orderNumber: 'R0003',
      customer: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
      items: [{ productId: { name: 'Walking Frame' }, quantity: 2, unitPrice: 30 }],
      rentalStart: '2024-01-20',
      rentalEnd: '2024-01-27',
      status: 'in-progress',
      totalAmount: 420,
      createdAt: '2024-01-14T09:15:00Z',
      notes: 'Urgent delivery required'
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      // const response = await ordersAPI.getAll({
      //   page: currentPage,
      //   limit: 10,
      //   status: statusFilter !== 'all' ? statusFilter : undefined,
      //   sortBy,
      //   sortOrder
      // });
      
      // Simulate API delay
      setTimeout(() => {
        setOrders(mockOrders);
        setTotalPages(1);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleNotesUpdate = async (orderId, newNotes) => {
    try {
      // await ordersAPI.update(orderId, { notes: newNotes });
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, notes: newNotes } : order
      ));
    } catch (error) {
      console.error('Error updating order notes:', error);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const exportOrders = () => {
    exportToCSV(filteredOrders, `orders-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const printOrder = (order) => {
    exportToPDF(order);
  };



  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Rental Orders</h1>
            
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
                  {user?.firstName?.[0]?.toUpperCase() || 'V'}
                </span>
              </div>
              <span className="text-sm">{user?.firstName || 'Vendor'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Create
            </button>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm transition-colors">
                Sent
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm transition-colors">
                <FiPrinter className="w-4 h-4" />
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm transition-colors">
                Confirm
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Pagination Info */}
            <span className="text-sm text-gray-400">1/80</span>
            
            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button className="p-1 text-gray-400 hover:text-white">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-white">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export Button */}
            <button
              onClick={exportOrders}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rental Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-400">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {order.items.map((item, index) => (
                            <div key={index}>
                              {item.productId.name} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(order.rentalStart).toLocaleDateString()} -
                        </div>
                        <div className="text-sm text-white">
                          {new Date(order.rentalEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge
                          status={order.status}
                          onChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                          editable={true}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          ₹{order.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printOrder(order)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="Print"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onStatusUpdate={handleStatusUpdate}
        onNotesUpdate={handleNotesUpdate}
      />
    </div>
  );
};

export default VendorOrdersPage;
