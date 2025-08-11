import React, { useState } from 'react';
import {
  FiX,
  FiUser,
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiPrinter,
  FiMail
} from 'react-icons/fi';
import OrderWorkflow from './OrderWorkflow';
import OrderNotesPanel from './OrderNotesPanel';

const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate, onNotesUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(order.id, newStatus);
  };



  const calculateRentalDuration = () => {
    const start = new Date(order.rentalStart);
    const end = new Date(order.rentalEnd);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Order Details</h2>
            <p className="text-gray-400 text-sm">Order #{order.orderNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Print Order"
            >
              <FiPrinter className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium">Name:</span> {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Email:</span> {order.customer.email}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Phone:</span> {order.customer.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Rental Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Rental Information
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium">Start Date:</span> {new Date(order.rentalStart).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">End Date:</span> {new Date(order.rentalEnd).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Duration:</span> {calculateRentalDuration()} days
                  </p>
                </div>
              </div>

              {/* Order Workflow */}
              <OrderWorkflow
                currentStatus={selectedStatus}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Products */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <FiPackage className="w-5 h-5 mr-2" />
                  Products
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-600 rounded-md">
                      <div>
                        <p className="text-white font-medium">{item.productId.name}</p>
                        <p className="text-gray-300 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{item.unitPrice}</p>
                        <p className="text-gray-300 text-sm">₹{item.unitPrice * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <FiDollarSign className="w-5 h-5 mr-2" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal || order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax:</span>
                    <span>₹{order.taxAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery:</span>
                    <span>₹{order.deliveryCharge || 0}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 flex justify-between text-white font-medium">
                    <span>Total:</span>
                    <span>₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Order Notes and History */}
              <OrderNotesPanel
                order={order}
                onNotesUpdate={onNotesUpdate}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              onClick={() => {/* Send notification */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiMail className="w-4 h-4 mr-2" />
              Send Update
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex items-center"
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
