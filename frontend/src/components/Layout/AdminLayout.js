import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 shadow-sm border-r border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-2 text-gray-300">
              🚧 Admin navigation will be implemented here
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
