import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiBarChart2,
  FiSearch,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const VendorDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    quotations: 10,
    rentals: 26,
    revenue: 10599
  });

  const [topCategories] = useState([
    { category: 'Rental - Service', ordered: 25, revenue: 2940 },
    { category: 'Equipment', ordered: 15, revenue: 1800 },
    { category: 'Furniture', ordered: 12, revenue: 1500 }
  ]);

  const [topProducts] = useState([
    { product: 'Wheelchairs', ordered: 10, revenue: 3032 },
    { product: 'Tables', ordered: 5, revenue: 1008 },
    { product: 'Chairs', ordered: 4, revenue: 3008 }
  ]);

  const [topCustomers] = useState([
    { customer: 'Customer1', ordered: 10, revenue: 3032 },
    { customer: 'Customer2', ordered: 5, revenue: 1008 },
    { customer: 'Customer3', ordered: 4, revenue: 3008 }
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              <Link
                to="/vendor-dashboard"
                className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
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
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            {/* Time Filter */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <FiCalendar className="w-4 h-4" />
              <span>Last 30 Days</span>
            </div>

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

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Quotations</p>
                <p className="text-3xl font-bold text-white">{stats.quotations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rentals</p>
                <p className="text-3xl font-bold text-white">{stats.rentals}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-3xl font-bold text-white">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Product Categories */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Top Product Categories</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="text-left pb-3">Category</th>
                      <th className="text-center pb-3">Ordered</th>
                      <th className="text-right pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {topCategories.map((item, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 text-white">{item.category}</td>
                        <td className="py-3 text-center text-gray-300">{item.ordered}</td>
                        <td className="py-3 text-right text-gray-300">₹{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Top Products</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="text-left pb-3">Product</th>
                      <th className="text-center pb-3">Ordered</th>
                      <th className="text-right pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {topProducts.map((item, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 text-white">{item.product}</td>
                        <td className="py-3 text-center text-gray-300">{item.ordered}</td>
                        <td className="py-3 text-right text-gray-300">₹{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 lg:col-span-2">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Top Customers</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="text-left pb-3">Customer</th>
                      <th className="text-center pb-3">Ordered</th>
                      <th className="text-right pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {topCustomers.map((item, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 text-white">{item.customer}</td>
                        <td className="py-3 text-center text-gray-300">{item.ordered}</td>
                        <td className="py-3 text-right text-gray-300">₹{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
