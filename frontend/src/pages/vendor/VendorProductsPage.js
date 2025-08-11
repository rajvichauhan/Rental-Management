import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiArrowLeft
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const VendorProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample products data - in real app, this would come from API
  const [products] = useState([
    {
      id: 'P001',
      name: 'Premium Wheelchair',
      category: 'Mobility Equipment',
      sku: 'WC-PREM-001',
      price: 50,
      stock: 15,
      availability: 'In Stock',
      condition: 'Excellent',
      rating: 4.8,
      image: '/images/wheelchair-1.jpg'
    },
    {
      id: 'P002',
      name: 'Hospital Bed - Electric',
      category: 'Medical Devices',
      sku: 'HB-ELEC-002',
      price: 120,
      stock: 8,
      availability: 'In Stock',
      condition: 'Good',
      rating: 4.6,
      image: '/images/hospital-bed.jpg'
    },
    {
      id: 'P003',
      name: 'Walking Frame',
      category: 'Mobility Equipment',
      sku: 'WF-STD-003',
      price: 25,
      stock: 22,
      availability: 'In Stock',
      condition: 'Excellent',
      rating: 4.7,
      image: '/images/walking-frame.jpg'
    },
    {
      id: 'P004',
      name: 'Oxygen Concentrator',
      category: 'Medical Devices',
      sku: 'OC-PORT-004',
      price: 200,
      stock: 5,
      availability: 'Low Stock',
      condition: 'Good',
      rating: 4.9,
      image: '/images/oxygen-concentrator.jpg'
    },
    {
      id: 'P005',
      name: 'Commode Chair',
      category: 'Accessibility',
      sku: 'CC-STD-005',
      price: 35,
      stock: 12,
      availability: 'In Stock',
      condition: 'Excellent',
      rating: 4.5,
      image: '/images/commode-chair.jpg'
    }
  ]);

  const categories = ['all', 'Mobility Equipment', 'Medical Devices', 'Accessibility', 'Rehabilitation'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewProduct = (productId) => {
    navigate(`/vendor/products/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/vendor/products/${productId}?edit=true`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      console.log('Deleting product:', productId);
      // Implement delete functionality
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'In Stock': return 'text-green-400';
      case 'Low Stock': return 'text-yellow-400';
      case 'Out of Stock': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vendor-dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Products Management</h1>
            
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
            {/* Add Product Button */}
            <button 
              onClick={() => navigate('/vendor/products/new')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Product
            </button>
            
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {filteredProducts.length} products found
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
              {/* Product Image */}
              <div className="h-48 bg-gray-700 flex items-center justify-center">
                <FiPackage className="w-16 h-16 text-gray-500" />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-white truncate">{product.name}</h3>
                  <span className="text-xs text-gray-400 ml-2">{product.sku}</span>
                </div>

                <p className="text-sm text-gray-400 mb-3">{product.category}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Price:</span>
                    <span className="text-white font-medium">₹{product.price}/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Stock:</span>
                    <span className="text-white">{product.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Status:</span>
                    <span className={`text-sm font-medium ${getAvailabilityColor(product.availability)}`}>
                      {product.availability}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Condition:</span>
                    <span className={`text-sm font-medium ${getConditionColor(product.condition)}`}>
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Rating:</span>
                    <span className="text-white">⭐ {product.rating}/5</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProduct(product.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiEye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <FiEdit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;
