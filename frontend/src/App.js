import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layout Components
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Customer Pages
import DashboardPage from "./pages/customer/DashboardPage";
import OrdersPage from "./pages/customer/OrdersPage";
import OrderDetailPage from "./pages/customer/OrderDetailPage";
import ProfilePage from "./pages/customer/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/UI/LoadingSpinner";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Helper function to get redirect path based on user role
  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case 'admin':
      case 'staff':
        return '/admin';
      case 'customer':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="App">
      <Routes>
        {/* Default route - redirect to home */}
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />

          {/* Auth Routes - redirect if already logged in */}
          <Route
            path="login"
            element={
              user ? (
                <Navigate to={getRedirectPath(user.role)} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="register"
            element={
              user ? (
                <Navigate to={getRedirectPath(user.role)} replace />
              ) : (
                <RegisterPage />
              )
            }
          />
          <Route
            path="forgot-password"
            element={
              user ? (
                <Navigate to={getRedirectPath(user.role)} replace />
              ) : (
                <ForgotPasswordPage />
              )
            }
          />
          <Route
            path="reset-password/:token"
            element={
              user ? (
                <Navigate to={getRedirectPath(user.role)} replace />
              ) : (
                <ResetPasswordPage />
              )
            }
          />
          <Route path="verify-email/:token" element={<VerifyEmailPage />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
