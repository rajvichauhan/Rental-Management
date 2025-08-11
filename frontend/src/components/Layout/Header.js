import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiSettings,
  FiPackage
} from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAdminOrStaff } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RentEasy</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
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
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-gray-700">
                    {user.firstName}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    {isAdminOrStaff() && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
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
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/products" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {!user && (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mx-4 btn btn-primary"
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
  );
};

export default Header;
