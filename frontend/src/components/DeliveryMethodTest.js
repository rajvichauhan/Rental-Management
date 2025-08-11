import { useState } from 'react';
import { FiHome, FiMapPin } from 'react-icons/fi';

// Simple test component to verify delivery method selection works
const DeliveryMethodTest = () => {
  const [deliveryMethod, setDeliveryMethod] = useState('');

  const handleInputChange = (section, field, value) => {
    if (section === '') {
      // Handle top-level fields like deliveryMethod
      setDeliveryMethod(value);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Choose Delivery Method</h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
          <input
            type="radio"
            name="deliveryMethod"
            value="home_delivery"
            checked={deliveryMethod === 'home_delivery'}
            onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)}
            className="text-blue-600"
          />
          <FiHome className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-white font-medium">Home Delivery</div>
            <div className="text-sm text-gray-400">Delivered to your doorstep (₹50 charge)</div>
          </div>
          <div className="text-white font-medium">₹50</div>
        </label>

        <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={deliveryMethod === 'pickup'}
            onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)}
            className="text-blue-600"
          />
          <FiMapPin className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-white font-medium">Store Pickup</div>
            <div className="text-sm text-gray-400">Pickup from our store (Free)</div>
          </div>
          <div className="text-white font-medium">Free</div>
        </label>
      </div>
      
      <div className="mt-4 p-3 bg-gray-700 rounded">
        <p className="text-white text-sm">
          Selected: <span className="font-medium">{deliveryMethod || 'None'}</span>
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Delivery Charge: {deliveryMethod === 'home_delivery' ? '₹50' : deliveryMethod === 'pickup' ? 'Free' : '-'}
        </p>
      </div>
    </div>
  );
};

export default DeliveryMethodTest;
