import React from "react";
import { Helmet } from "react-helmet-async";

const CartPage = () => {
  return (
    <>
      <Helmet>
        <title>Shopping Cart - RentEasy</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Shopping Cart</h1>
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-8">
            <p className="text-blue-200">
              🚧 Shopping cart functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
