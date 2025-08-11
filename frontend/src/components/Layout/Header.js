import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiPackage,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

const Header = () => {
  const { user, logout, isAdminOrStaff } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Check if we're on the dashboard/home page to show the dashboard navbar
  const isDashboardPage = location.pathname === '/' || location.pathname.startsWith('/dashboard');

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      {/* Main Header - Always visible */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FiPackage className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RentEasy</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/products" 
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <FiShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-gray-300">
                      {user.firstName}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      
                      {isAdminOrStaff() && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiSettings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <hr className="my-1 border-gray-700" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-blue-400 transition-colors px-3 py-2 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/products" 
                  className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  to="/about" 
                  className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                
                <hr className="my-2 border-gray-700" />
                
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    {isAdminOrStaff() && (
                      <Link
                        to="/admin"
                        className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiSettings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors flex items-center w-full text-left"
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="mx-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Click outside to close user menu */}
        {isUserMenuOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </header>

      {/* Dashboard Navigation - Only show on dashboard pages */}
      {isDashboardPage && user && (
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                <nav className="hidden md:flex space-x-6">
                  <Link to="/" className="px-3 py-2 rounded-md bg-gray-700 text-white">Dashboard</Link>
                  <Link to="/products" className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">Rental</Link>
                  <Link to="/orders" className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">Order</Link>
                  <Link to="/products" className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">Products</Link>
                  <Link to="/reports" className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">Reporting</Link>
                  <Link to="/settings" className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">Setting</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
                  />
                </div>
                <div className="text-sm text-gray-300">Last 30 days</div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white">{user.firstName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
