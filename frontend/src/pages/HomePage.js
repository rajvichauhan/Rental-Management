import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiArrowRight,
  FiBarChart2,
} from "react-icons/fi";

const HomePage = () => {
  // Dashboard metrics data
  const metrics = [
    {
      title: "Total Products",
      value: "1,247",
      icon: FiPackage,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Active Rentals",
      value: "89",
      icon: FiShoppingCart,
      color: "from-green-500 to-green-600",
      change: "+8%",
    },
    {
      title: "Happy Customers",
      value: "2,156",
      icon: FiUsers,
      color: "from-purple-500 to-purple-600",
      change: "+23%",
    },
    {
      title: "Revenue",
      value: "$45,890",
      icon: FiDollarSign,
      color: "from-orange-500 to-orange-600",
      change: "+15%",
    },
  ];

  // Top categories data
  const topCategories = [
    { name: "Electronics", orders: 156, revenue: "$12,450" },
    { name: "Tools", orders: 89, revenue: "$8,920" },
    { name: "Photography", orders: 67, revenue: "$9,340" },
    { name: "Sports", orders: 45, revenue: "$5,670" },
  ];

  // Top products data
  const topProducts = [
    { name: "Professional Camera", orders: 23, revenue: "$3,450" },
    { name: "Power Drill Set", orders: 18, revenue: "$1,890" },
    { name: "Sound System", orders: 15, revenue: "$2,250" },
    { name: "Projector", orders: 12, revenue: "$1,680" },
  ];

  // Top customers data
  const topCustomers = [
    { name: "Customer1", orders: 15, revenue: "$3,450" },
    { name: "Customer2", orders: 12, revenue: "$2,890" },
    { name: "Customer3", orders: 9, revenue: "$2,250" },
    { name: "Customer4", orders: 7, revenue: "$1,680" },
  ];

  return (
    <>
      <Helmet>
        <title>RentEasy - Dashboard</title>
        <meta
          name="description"
          content="Your rental management dashboard - track products, orders, and performance at a glance."
        />
      </Helmet>

      {/* Dashboard Container */}
      <div className="min-h-screen bg-gray-900 text-white">

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-white">
                      {metric.value}
                    </p>
                    <p className="text-green-400 text-sm mt-1">
                      {metric.change}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Product Categories */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Product Categories
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2">
                  <span>Category</span>
                  <span>Ordered</span>
                  <span>Revenue</span>
                </div>
                {topCategories.map((category, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                    <span className="text-white">{category.name}</span>
                    <span className="text-gray-300">{category.orders}</span>
                    <span className="text-gray-300">{category.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Products
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2">
                  <span>Product</span>
                  <span>Ordered</span>
                  <span>Revenue</span>
                </div>
                {topProducts.map((product, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                    <span className="text-white">{product.name}</span>
                    <span className="text-gray-300">{product.orders}</span>
                    <span className="text-gray-300">{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Customers
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2">
                  <span>Customer</span>
                  <span>Ordered</span>
                  <span>Revenue</span>
                </div>
                {topCustomers.map((customer, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                    <span className="text-white">{customer.name}</span>
                    <span className="text-gray-300">{customer.orders}</span>
                    <span className="text-gray-300">{customer.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiPackage className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Browse Products</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiShoppingCart className="w-5 h-5 text-green-400" />
                    <span className="text-white">View Orders</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiBarChart2 className="w-5 h-5 text-purple-400" />
                    <span className="text-white">View Reports</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-between p-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiUsers className="w-5 h-5 text-white" />
                    <span className="text-white">Get Started</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
