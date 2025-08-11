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

// Vendor Pages
import VendorDashboardPage from "./pages/VendorDashboardPage";
import VendorRentalPage from "./pages/vendor/VendorRentalPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorProductDetailPage from "./pages/vendor/ProductDetailPage";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";

// Admin Pages (Legacy - to be converted to vendor)
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";
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
      case 'vendor':
        return '/vendor-dashboard';
      case 'customer':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="App">
      <Routes>
        {/* Default route - redirect based on authentication */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getRedirectPath(user.role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />

          {/* Auth routes with proper redirection */}
          <Route
            path="login"
            element={
              <AuthGuard requireAuth={false}>
                <LoginPage />
              </AuthGuard>
            }
          />

          <Route
            path="register"
            element={
              <AuthGuard requireAuth={false}>
                <RegisterPage />
              </AuthGuard>
            }
          />
          <Route
            path="forgot-password"
            element={
              <AuthGuard requireAuth={false}>
                <ForgotPasswordPage />
              </AuthGuard>
            }
          />
          <Route
            path="reset-password/:token"
            element={
              <AuthGuard requireAuth={false}>
                <ResetPasswordPage />
              </AuthGuard>
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

        {/* Vendor Protected Routes */}
        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/rental"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorRentalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products/:id"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProductDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy Admin Routes - Now for Vendors */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
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
