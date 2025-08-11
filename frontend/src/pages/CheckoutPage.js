import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiChevronRight,
  FiChevronLeft,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiCheck,
  FiAlertCircle,
  FiMapPin,
  FiUser,
  FiHome,
  FiMinus,
  FiPlus,
  FiTrash2
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    getCartSummary,
    calculateRentalDuration,
    calculateItemSubtotal,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  // Checkout steps
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, name: 'Review Order', path: 'review' },
    { id: 2, name: 'Delivery', path: 'delivery' },
    { id: 3, name: 'Payment', path: 'payment' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Billing Information
    billingAddress: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    // Delivery Information
    deliveryAddress: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    sameAsbilling: true,
    deliveryMethod: '',
    // Payment Information
    paymentMethod: 'card',
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    // Agreement
    acceptTerms: false,
    acceptRentalAgreement: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  // Calculate totals
  const cartSummary = getCartSummary();
  const deliveryCharge = formData.deliveryMethod === 'home_delivery' && cartSummary.subtotal > 0 ? 50 : 0;
  const discountAmount = appliedCoupon ?
    (appliedCoupon.type === 'percentage' ?
      (cartSummary.subtotal * appliedCoupon.discount) / 100 :
      Math.min(appliedCoupon.discount, cartSummary.subtotal)) : 0;
  const finalTotal = Math.max(0, cartSummary.subtotal + cartSummary.tax + deliveryCharge - discountAmount);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    if (section === '') {
      // Handle top-level fields like deliveryMethod, paymentMethod
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Handle nested fields like billingAddress.fullName
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If same as billing is checked, copy billing to delivery
    if (field === 'sameAsbilling' && value) {
      setFormData(prev => ({
        ...prev,
        deliveryAddress: { ...prev.billingAddress }
      }));
    }
  };



  // Handle step navigation
  const handleNextStep = () => {
    // Skip validation - allow navigation to next step regardless of form completion
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
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
    }
  };

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      if (window.confirm('Remove this item from cart?')) {
        removeItem(itemId);
      }
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    // Skip all validation - submit order immediately with whatever data is provided
    setIsProcessing(true);

    try {
      // Prepare order data with whatever information is available
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          rentalStart: item.rentalDates.start,
          rentalEnd: item.rentalDates.end,
          unitPrice: item.price
        })),
        billingAddress: formData.billingAddress,
        deliveryAddress: formData.sameAsbilling ? formData.billingAddress : formData.deliveryAddress,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        subtotal: cartSummary.subtotal,
        taxAmount: cartSummary.tax,
        deliveryCharge: deliveryCharge,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        appliedCoupon: appliedCoupon?.code || null
      };

      // Create order immediately without validation
      const orderResponse = await ordersAPI.create(orderData);
      const orderId = orderResponse.data.data.id;

      // Skip payment processing validation - just create the order
      // No payment processing validation or requirements

      // Clear cart and redirect to success page
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/dashboard/orders/${orderId}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if redirecting
  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - RentEasy</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link to="/products" className="hover:text-white transition-colors">
              Rental Shop
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <Link to="/cart" className="hover:text-white transition-colors">
              Review Order
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-white">{steps.find(s => s.id === currentStep)?.name}</span>
          </nav>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= step.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <FiChevronRight className="w-4 h-4 text-gray-600 mx-4" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Step Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Review Order */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Review Your Order</h2>

                  {cartItems.map((item) => {
                    const duration = calculateRentalDuration(item.rentalDates.start, item.rentalDates.end);
                    const itemSubtotal = calculateItemSubtotal(item);

                    return (
                      <div
                        key={item.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
                              {item.product.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-center">
                                  <div className="w-10 h-12 bg-gray-600 rounded border border-gray-500 mx-auto flex items-center justify-center relative">
                                    <div className="absolute -top-1 -right-1 w-3 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
                                      <div className="w-1.5 h-2 bg-gray-400 rounded-sm"></div>
                                    </div>
                                    <div className="text-sm text-gray-400">📦</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              ₹{item.price.toLocaleString()} per day
                            </p>
                            <p className="text-sm text-gray-400 mb-3">
                              {formatDate(item.rentalDates.start)} - {formatDate(item.rentalDates.end)}
                              <span className="mx-2">•</span>
                              {duration} day{duration > 1 ? 's' : ''}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Qty</span>
                                <button
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  className="w-6 h-6 bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-white font-medium text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  className="w-6 h-6 bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">
                                  Subtotal: <span className="text-white font-medium">₹{itemSubtotal.toLocaleString()}</span>
                                </span>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Remove ${item.product.name} from cart?`)) {
                                      removeItem(item.id);
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
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

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      Back to Cart
                    </Link>
                    <button
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Continue to Delivery
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Delivery Information</h2>

                  {/* Billing Address */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Invoice Address
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.fullName}
                          onChange={(e) => handleInputChange('billingAddress', 'fullName', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.billingAddress.email}
                          onChange={(e) => handleInputChange('billingAddress', 'email', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.billingAddress.phone}
                          onChange={(e) => handleInputChange('billingAddress', 'phone', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Street Address
                        </label>
                        <textarea
                          value={formData.billingAddress.street}
                          onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                          rows={3}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                          placeholder="Enter your complete address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.state}
                          onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.postalCode}
                          onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FiMapPin className="w-5 h-5" />
                        Delivery Address
                      </h3>

                      {/* Same as billing checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={formData.sameAsbilling}
                            onChange={(e) => handleCheckboxChange('sameAsbilling', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            formData.sameAsbilling ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              formData.sameAsbilling ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-300">
                          Billing address same as delivery address
                        </span>
                      </label>
                    </div>

                    {!formData.sameAsbilling && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress.fullName}
                            onChange={(e) => handleInputChange('deliveryAddress', 'fullName', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter recipient name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.deliveryAddress.phone}
                            onChange={(e) => handleInputChange('deliveryAddress', 'phone', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Street Address
                          </label>
                          <textarea
                            value={formData.deliveryAddress.street}
                            onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Enter delivery address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress.city}
                            onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress.state}
                            onChange={(e) => handleInputChange('deliveryAddress', 'state', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress.postalCode}
                            onChange={(e) => handleInputChange('deliveryAddress', 'postalCode', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Method */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Choose Delivery Method</h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="home_delivery"
                          checked={formData.deliveryMethod === 'home_delivery'}
                          onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)}
                          className="text-blue-600"
                        />
                        <FiHome className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Home Delivery</div>
                          <div className="text-sm text-gray-400">Delivered to your doorstep (₹50 charge)</div>
                        </div>
                        <div className="text-white font-medium">₹50</div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={formData.deliveryMethod === 'pickup'}
                          onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)}
                          className="text-blue-600"
                        />
                        <FiMapPin className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Store Pickup</div>
                          <div className="text-sm text-gray-400">Pickup from our store (Free)</div>
                        </div>
                        <div className="text-white font-medium">Free</div>
                      </label>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      Back to Review
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Payment Information</h2>

                  {/* Payment Method Selection */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                          className="text-blue-600"
                        />
                        <FiCreditCard className="w-5 h-5 text-gray-400" />
                        <div className="text-white font-medium">Credit/Debit Card</div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                          className="text-blue-600"
                        />
                        <FiSmartphone className="w-5 h-5 text-gray-400" />
                        <div className="text-white font-medium">UPI Payment</div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                          className="text-blue-600"
                        />
                        <FiDollarSign className="w-5 h-5 text-gray-400" />
                        <div className="text-white font-medium">Cash on Delivery</div>
                      </label>
                    </div>
                  </div>

                  {/* Card Details Form */}
                  {formData.paymentMethod === 'card' && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Card Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            value={formData.cardDetails.cardholderName}
                            onChange={(e) => handleInputChange('cardDetails', 'cardholderName', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="Enter cardholder name"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={formData.cardDetails.cardNumber}
                            onChange={(e) => handleInputChange('cardDetails', 'cardNumber', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={formData.cardDetails.expiryDate}
                            onChange={(e) => handleInputChange('cardDetails', 'expiryDate', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={formData.cardDetails.cvv}
                            onChange={(e) => handleInputChange('cardDetails', 'cvv', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms and Agreements */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Terms & Agreements</h3>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={(e) => handleCheckboxChange('acceptTerms', e.target.checked)}
                          className="mt-1 text-blue-600"
                        />
                        <div className="text-sm text-gray-300">
                          I agree to the{' '}
                          <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                            Privacy Policy
                          </Link>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.acceptRentalAgreement}
                          onChange={(e) => handleCheckboxChange('acceptRentalAgreement', e.target.checked)}
                          className="mt-1 text-blue-600"
                        />
                        <div className="text-sm text-gray-300">
                          I accept the{' '}
                          <Link to="/rental-agreement" className="text-blue-400 hover:text-blue-300 underline">
                            Rental Agreement
                          </Link>{' '}
                          and understand the terms of rental, return policy, and security deposit requirements
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      Back to Delivery
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-8">
                {/* Order Summary Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Order Summary</h3>
                  <span className="text-sm text-gray-400">
                    {cartSummary.itemCount} Item{cartSummary.itemCount > 1 ? 's' : ''} - ₹{cartSummary.subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sub Total</span>
                    <span className="text-white">₹{cartSummary.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Delivery Charge</span>
                    <span className="text-white">
                      {formData.deliveryMethod === 'pickup' ? '-' :
                       deliveryCharge > 0 ? `₹${deliveryCharge}` : '-'}
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
                        ₹{finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apply Coupon Section */}
                {currentStep < 3 && (
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
                          onClick={() => setAppliedCoupon(null)}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyCoupon();
                            }
                          }}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim()}
                          className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-white mb-1">Secure Checkout</p>
                      <p>Your payment information is encrypted and secure. We never store your card details.</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-gray-400 text-center space-y-1">
                  <p>Secure checkout powered by Stripe</p>
                  <p>Free cancellation up to 24 hours before rental</p>
                  <p>24/7 customer support available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
