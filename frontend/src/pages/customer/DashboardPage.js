import React from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../contexts/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard - RentEasy</title>
        <meta
          name="description"
          content="Manage your rentals, orders, and account settings."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Manage your rentals, orders, and account settings from your
            dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Active Rentals
            </h3>
            <p className="text-3xl font-bold text-blue-400">0</p>
            <p className="text-sm text-gray-400">Currently rented items</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-green-400">0</p>
            <p className="text-sm text-gray-400">All-time orders</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Saved Items
            </h3>
            <p className="text-3xl font-bold text-purple-400">0</p>
            <p className="text-sm text-gray-400">Items in wishlist</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-8 text-center">
          <p className="text-blue-200">
            🚧 Dashboard functionality is under development. Full features will
            be available soon.
          </p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
