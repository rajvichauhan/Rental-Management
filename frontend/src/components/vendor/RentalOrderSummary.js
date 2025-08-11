import React from 'react';
import { FiPackage, FiHash, FiCalendar, FiUser } from 'react-icons/fi';

const RentalOrderSummary = ({ rentalOrder }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getUniqueProductCount = () => {
    return rentalOrder.orderLines.length;
  };

  const getTotalQuantity = () => {
    return rentalOrder.orderLines.reduce((total, line) => total + line.quantity, 0);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <FiHash className="w-5 h-5 mr-2" />
        Order Summary
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Order ID</p>
              <p className="text-white font-mono text-sm">{rentalOrder.id}</p>
            </div>
            <FiHash className="w-4 h-4 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Unique Products</p>
              <p className="text-white font-semibold text-sm">{getUniqueProductCount()}</p>
            </div>
            <FiPackage className="w-4 h-4 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Total Quantity</p>
              <p className="text-white font-semibold text-sm">{getTotalQuantity()}</p>
            </div>
            <FiPackage className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Order Date</p>
              <p className="text-white text-sm">{formatDate(rentalOrder.rentalOrderDate)}</p>
            </div>
            <FiCalendar className="w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Product IDs List */}
      {rentalOrder.orderLines.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-gray-400 text-xs mb-2">Product IDs in this order:</p>
          <div className="flex flex-wrap gap-2">
            {rentalOrder.orderLines.map((line) => (
              <span
                key={line.id}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono"
              >
                {line.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Customer Info */}
      {rentalOrder.customer && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center">
            <FiUser className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-400 text-xs">Customer: </span>
            <span className="text-white text-sm ml-1">{rentalOrder.customer}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalOrderSummary;
