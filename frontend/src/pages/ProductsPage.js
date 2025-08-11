import React from 'react';
import { Helmet } from 'react-helmet-async';

const ProductsPage = () => {
  return (
    <>
      <Helmet>
        <title>Products - RentEasy</title>
        <meta name="description" content="Browse our extensive collection of rental products and equipment." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-lg text-gray-600 mb-8">
            Browse our extensive collection of rental products and equipment.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <p className="text-blue-800">
              🚧 This page is under construction. Product listing functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
