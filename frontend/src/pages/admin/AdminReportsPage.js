import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdminReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reports & Analytics - Admin - RentEasy</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <p className="text-blue-800">
            🚧 Reports and analytics will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage;
