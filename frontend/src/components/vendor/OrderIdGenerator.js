import React, { useState } from 'react';
import { FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';

const OrderIdGenerator = ({ currentId, onIdChange, prefix = 'R' }) => {
  const [copied, setCopied] = useState(false);

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleGenerateNew = () => {
    const newId = generateOrderId();
    onIdChange(newId);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-white">→{currentId}</span>
        <button
          onClick={handleCopyId}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Copy Order ID"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <button
        onClick={handleGenerateNew}
        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
        title="Generate new Order ID"
      >
        <FiRefreshCw className="w-3 h-3 mr-1" />
        New ID
      </button>
    </div>
  );
};

export default OrderIdGenerator;
