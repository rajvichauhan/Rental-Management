import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiHeart,
  FiChevronRight,
  FiShoppingBag,
  FiArrowLeft
} from "react-icons/fi";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    getCartSummary,
    calculateRentalDuration,
    calculateItemSubtotal
  } = useCart();
  const { addToWishlist } = useWishlist();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Get cart summary with delivery and tax calculations
  const cartSummary = getCartSummary();
  const deliveryCharge = cartSummary.subtotal > 0 ? 50 : 0; // ₹50 delivery charge
  const finalTotal = cartSummary.subtotal + cartSummary.tax + deliveryCharge;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle add to wishlist
  const handleAddToWishlist = (item) => {
    addToWishlist({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image
    });
    toast.success(`${item.name} added to wishlist`);
  };

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  // Handle remove item with confirmation
  const handleRemoveItem = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (window.confirm(`Remove ${item?.product?.name} from cart?`)) {
      removeItem(itemId);
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      // Simulate API call for coupon validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock coupon validation - in real app, this would be an API call
      const validCoupons = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'FLAT50': { discount: 50, type: 'fixed' },
        'WELCOME20': { discount: 20, type: 'percentage' }
      };

      const coupon = validCoupons[couponCode.toUpperCase()];

      if (coupon) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          ...coupon
        });
        toast.success(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
        setCouponCode("");
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percentage') {
      return (cartSummary.subtotal * appliedCoupon.discount) / 100;
    } else {
      return Math.min(appliedCoupon.discount, cartSummary.subtotal);
    }
  };

  const discountAmount = calculateDiscount();
  const finalTotalWithDiscount = Math.max(0, finalTotal - discountAmount);

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    navigate("/dashboard/checkout");
  };

  return (
    <>
      <Helmet>
        <title>Review Order - RentEasy</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link to="/products" className="hover:text-white transition-colors">
              Rental Shop
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-white">Review Order</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Review Order</h1>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 max-w-md mx-auto">
                <FiShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-6">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <FiShoppingBag className="w-4 h-4" />
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Order Overview</h2>

                {cartItems.map((item) => {
                  const duration = calculateRentalDuration(item.rentalDates.start, item.rentalDates.end);
                  const itemSubtotal = calculateItemSubtotal(item);

                  return (
                    <div
                      key={item.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="w-12 h-14 bg-gray-600 rounded border border-gray-500 mx-auto mb-1 flex items-center justify-center relative">
                                  <div className="absolute -top-1 -right-1 w-4 h-6 bg-gray-500 rounded-sm flex items-center justify-center">
                                    <div className="w-2 h-3 bg-gray-400 rounded-sm"></div>
                                  </div>
                                  <div className="text-lg text-gray-400">📦</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {item.product.name}
                            </h3>
                            <span className="text-lg font-bold text-white ml-4">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Rental Duration */}
                          <div className="text-sm text-gray-400 mb-3">
                            <span>
                              {formatDate(item.rentalDates.start)} - {formatDate(item.rentalDates.end)}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{duration} day{duration > 1 ? 's' : ''}</span>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Qty</span>
                                <button
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  className="w-8 h-8 bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <FiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center text-white font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  className="w-8 h-8 bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                >
                                  <FiPlus className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Item Subtotal */}
                              <div className="text-sm text-gray-400">
                                Subtotal: <span className="text-white font-medium">₹{itemSubtotal.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddToWishlist(item)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                title="Add to Wishlist"
                              >
                                <FiHeart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                title="Remove Item"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart Button */}
                {cartItems.length > 0 && (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to clear your cart?")) {
                          clearCart();
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-8">
                  {/* Summary Header */}
                  <h3 className="text-lg font-semibold text-white mb-6">Order Summary</h3>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sub Total</span>
                      <span className="text-white">₹{cartSummary.subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Delivery Charge</span>
                      <span className="text-white">
                        {deliveryCharge > 0 ? `₹${deliveryCharge}` : '-'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Taxes</span>
                      <span className="text-white">₹{Math.round(cartSummary.tax).toLocaleString()}</span>
                    </div>

                    {/* Applied Coupon Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">
                          Discount ({appliedCoupon.code})
                        </span>
                        <span className="text-green-400">
                          -₹{discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-lg font-bold text-white">
                          ₹{finalTotalWithDiscount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Coupon Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-white mb-3">Apply Coupon</h4>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-900 border border-green-700 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm font-medium">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-green-300 text-xs">
                            ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}% off` : `₹${appliedCoupon.discount} off`})
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon Code"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyCoupon();
                            }
                          }}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                          className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {isApplyingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Proceed to Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to checkout
                  </button>

                  {/* Additional Info */}
                  <div className="mt-4 text-xs text-gray-400 text-center">
                    <p>Secure checkout powered by Stripe</p>
                    <p className="mt-1">Free cancellation up to 24 hours before rental</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
