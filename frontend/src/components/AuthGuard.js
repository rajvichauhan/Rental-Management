import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const AuthGuard = ({ children, requireAuth = true, allowedRoles = null, redirectTo = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Helper function to get role-based redirect path
  const getRoleBasedRedirect = (userRole) => {
    switch (userRole) {
      case 'vendor':
        return '/vendor-dashboard';
      case 'customer':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && user) {
    const redirectPath = redirectTo || getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // If specific roles are required, check user role
  if (requireAuth && allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default AuthGuard;
