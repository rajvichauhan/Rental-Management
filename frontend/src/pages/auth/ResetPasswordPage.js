import React from 'react';
import { Helmet } from 'react-helmet-async';

const ResetPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Reset Password - RentEasy</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-4 text-gray-600">
              🚧 Password reset functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
