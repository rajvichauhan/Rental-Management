import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard - RentEasy</title>
        <meta name="description" content="Manage your rentals, orders, and account settings." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your rentals, orders, and account settings from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Rentals</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Currently rented items</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">All-time orders</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Items</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Items in wishlist</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-800">
            🚧 Dashboard functionality is under development. Full features will be available soon.
          </p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
