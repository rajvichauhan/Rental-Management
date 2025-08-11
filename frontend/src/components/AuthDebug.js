import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthDebug = () => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug Info</h4>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</div>
        <div><strong>User Role:</strong> {user?.role || 'None'}</div>
        <div><strong>User Email:</strong> {user?.email || 'None'}</div>
        <div><strong>Token:</strong> {token ? 'Present' : 'None'}</div>
        <div><strong>Current Path:</strong> {location.pathname}</div>
        <div><strong>Expected Redirect:</strong> {
          user ? (
            user.role === 'vendor' ? '/vendor-dashboard' : '/dashboard'
          ) : '/login'
        }</div>
      </div>
    </div>
  );
};

export default AuthDebug;
