import React from 'react';
import { Helmet } from 'react-helmet-async';

const ProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>My Profile - RentEasy</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <p className="text-blue-800">
              🚧 Profile page will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
