import React, { useState } from 'react';
import { FiEdit, FiSave, FiX, FiMessageSquare, FiClock } from 'react-icons/fi';

const OrderNotesPanel = ({ order, onNotesUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(order?.notes || '');
  const [orderHistory] = useState([
    {
      id: 1,
      action: 'Order created',
      timestamp: order?.createdAt || new Date().toISOString(),
      user: 'System',
      details: 'Order was created by customer'
    },
    {
      id: 2,
      action: 'Status updated',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Vendor',
      details: `Status changed to ${order?.status || 'pending'}`
    }
  ]);

  const handleSaveNotes = () => {
    onNotesUpdate(order.id, notes);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNotes(order?.notes || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Order Notes Section */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <FiMessageSquare className="w-5 h-5 mr-2" />
            Order Notes
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm"
            >
              <FiEdit className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              rows="4"
              placeholder="Add order notes, special instructions, or internal comments..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiSave className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500 transition-colors flex items-center"
              >
                <FiX className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-300">
            {order?.notes ? (
              <p className="whitespace-pre-wrap">{order.notes}</p>
            ) : (
              <p className="italic text-gray-400">No notes added yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiClock className="w-5 h-5 mr-2" />
          Order History
        </h3>
        <div className="space-y-3">
          {orderHistory.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-600 rounded-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{entry.action}</p>
                  <span className="text-gray-400 text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{entry.details}</p>
                <p className="text-gray-400 text-xs">by {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
            Send Update Email
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
            Generate Invoice
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
            Schedule Pickup
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
            Track Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderNotesPanel;
