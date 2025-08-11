import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdminOrdersPage = () => {
  return (
    <>
      <Helmet>
        <title>Manage Orders - Admin - RentEasy</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Orders</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <p className="text-blue-800">
            🚧 Order management will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminOrdersPage;
