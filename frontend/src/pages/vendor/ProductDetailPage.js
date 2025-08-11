import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiPlus,
  FiEdit,
  FiSave,
  FiArrowLeft,
  FiLoader
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(80);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample product data - in real app, this would come from API
  const [product, setProduct] = useState({
    id: id || 'P001',
    name: 'Premium Wheelchair',
    description: 'High-quality manual wheelchair with ergonomic design and lightweight aluminum frame. Perfect for both indoor and outdoor use.',
    category: 'Mobility Equipment',
    subcategory: 'Wheelchairs',
    sku: 'WC-PREM-001',
    brand: 'MediCare Pro',
    model: 'Comfort Plus 2024',
    weight: '15 kg',
    dimensions: '65cm x 60cm x 90cm',
    material: 'Aluminum Frame with Fabric Seat',
    color: 'Navy Blue',
    features: [
      'Lightweight aluminum frame',
      'Ergonomic armrests',
      'Quick-release wheels',
      'Adjustable footrests',
      'Anti-tip wheels',
      'Foldable design'
    ],
    specifications: {
      'Seat Width': '45cm',
      'Seat Depth': '40cm',
      'Weight Capacity': '120kg',
      'Wheel Size': '24" rear, 8" front',
      'Frame Material': 'Aluminum',
      'Warranty': '2 years'
    },
    availability: 'In Stock',
    stockQuantity: 15,
    condition: 'Excellent',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    images: [
      '/images/wheelchair-1.jpg',
      '/images/wheelchair-2.jpg',
      '/images/wheelchair-3.jpg'
    ],
    rentalPricing: {
      daily: { standard: 50, premium: 75, bulk: 40 },
      weekly: { standard: 300, premium: 450, bulk: 240 },
      monthly: { standard: 1000, premium: 1500, bulk: 800 }
    },
    reservationCharges: {
      extraHour: 25,
      extraDay: 60,
      lateFee: 30
    },
    tags: ['mobility', 'wheelchair', 'medical', 'aluminum'],
    rating: 4.8,
    reviewCount: 24,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  });

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        setIsEditing(false);
        console.log('Product updated successfully');
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    const newStock = prompt('Enter new stock quantity:', product.stockQuantity);
    if (newStock === null) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockQuantity: parseInt(newStock) })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        console.log('Stock updated successfully');
      } else {
        setError(data.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/vendor/products/new');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Product</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/vendor/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Products
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
              onClick={() => navigate('/vendor/products')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Product Details</h1>
            
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
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Order
              </Link>
              <Link
                to="/vendor/products"
                className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
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
            {/* Create Button */}
            <button 
              onClick={handleCreateNew}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create
            </button>
            
            <span className="text-gray-400 text-sm">Product</span>
            <FiSettings className="w-4 h-4 text-gray-400" />
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleUpdateStock}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Update stock
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Pagination Info */}
            <span className="text-sm text-gray-400">{currentPage}/{totalPages}</span>
            
            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === totalPages}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - General Product Info */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">General Product Info</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              >
                {isEditing ? <FiSave className="w-4 h-4 mr-1" /> : <FiEdit className="w-4 h-4 mr-1" />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{product.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={product.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-mono">{product.sku}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  {isEditing ? (
                    <select
                      value={product.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Mobility Equipment">Mobility Equipment</option>
                      <option value="Medical Devices">Medical Devices</option>
                      <option value="Rehabilitation">Rehabilitation</option>
                      <option value="Accessibility">Accessibility</option>
                    </select>
                  ) : (
                    <p className="text-white">{product.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={product.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{product.subcategory}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={product.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-300">{product.description}</p>
                )}
              </div>

              {/* Product Specifications */}
              <div>
                <h3 className="text-md font-medium text-white mb-3">Product Specifications</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-300">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Features */}
              <div>
                <h3 className="text-md font-medium text-white mb-3">Key Features</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Availability & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      product.availability === 'In Stock' ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    <span className="text-white">{product.availability}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={product.stockQuantity}
                      onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{product.stockQuantity} units</p>
                  )}
                </div>
              </div>

              {/* Maintenance Information */}
              <div>
                <h3 className="text-md font-medium text-white mb-3">Maintenance Information</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Condition:</span>
                      <span className="text-white">{product.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Maintenance:</span>
                      <span className="text-white">{new Date(product.lastMaintenance).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next Maintenance:</span>
                      <span className="text-white">{new Date(product.nextMaintenance).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rating:</span>
                      <span className="text-white">{product.rating}/5 ({product.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button for Editing */}
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Rental Pricing */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Rental Pricing</h2>

            {/* Pricing Table */}
            <div className="space-y-6">
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-sm font-medium text-gray-300">Rental Period</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-300">Pricelist</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-300">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Daily Pricing */}
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white">Daily</td>
                      <td className="py-3 text-gray-300">Standard</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.daily.standard}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Premium</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.daily.premium}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Bulk</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.daily.bulk}</td>
                    </tr>

                    {/* Weekly Pricing */}
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white">Weekly</td>
                      <td className="py-3 text-gray-300">Standard</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.weekly.standard}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Premium</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.weekly.premium}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Bulk</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.weekly.bulk}</td>
                    </tr>

                    {/* Monthly Pricing */}
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white">Monthly</td>
                      <td className="py-3 text-gray-300">Standard</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.monthly.standard}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Premium</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.monthly.premium}</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white"></td>
                      <td className="py-3 text-gray-300">Bulk</td>
                      <td className="py-3 text-white">₹{product.rentalPricing.monthly.bulk}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rental Reservation Charges */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Rental Reservations charges</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Extra Hour :</span>
                      <span className="text-white font-medium">₹{product.reservationCharges.extraHour}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Extra Days :</span>
                      <span className="text-white font-medium">₹{product.reservationCharges.extraDay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Late Fee :</span>
                      <span className="text-white font-medium">₹{product.reservationCharges.lateFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Pricing Information */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Pricing Notes</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Standard pricing applies to regular customers</li>
                    <li>• Premium pricing includes additional services and priority support</li>
                    <li>• Bulk pricing available for orders of 5+ units or 30+ days</li>
                    <li>• All prices include basic maintenance and support</li>
                    <li>• Security deposit may be required for high-value items</li>
                  </ul>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
                  Update Pricing
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
                  Add to Rental
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
