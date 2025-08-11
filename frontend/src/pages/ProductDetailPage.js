import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiHeart,
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiCalendar,
  FiShare2,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiCopy,
  FiMail,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { productsAPI } from "../services/api";

import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Random product descriptions
  const getRandomDescription = () => {
    const descriptions = [
      "High-quality professional equipment perfect for your rental needs. Built with durability and performance in mind, this product offers exceptional value for both short-term and long-term rentals.",
      "Premium grade equipment designed for heavy-duty use. Features advanced technology and robust construction to ensure reliable performance in demanding environments.",
      "Versatile and user-friendly equipment suitable for various applications. Easy to operate with comprehensive safety features and excellent build quality.",
      "State-of-the-art equipment with cutting-edge features. Ideal for professional use with superior performance characteristics and modern design.",
      "Reliable and efficient equipment perfect for commercial and residential applications. Engineered for optimal performance with minimal maintenance requirements.",
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // Random terms and conditions
  const getRandomTerms = () => {
    const terms = [
      "• Rental period minimum 1 day, maximum 30 days\n• Security deposit required for all rentals\n• Equipment must be returned in original condition\n• Late return fees apply after grace period\n• Damage assessment charges may apply\n• Renter responsible for equipment during rental period",
      "• Valid ID and contact information required\n• Equipment inspection required before and after rental\n• No subletting or transfer of rental agreement\n• Cancellation policy: 24 hours notice required\n• Insurance coverage recommended for high-value items\n• Technical support available during business hours",
      "• Delivery and pickup services available for additional fee\n• Equipment training provided if required\n• Maintenance and repairs covered during rental period\n• Replacement equipment provided in case of malfunction\n• Rental extensions subject to availability\n• Payment due before equipment release",
      "• Professional use only for commercial grade equipment\n• Safety guidelines must be followed at all times\n• Regular maintenance checks required for long-term rentals\n• Environmental conditions may affect rental terms\n• Liability insurance required for certain equipment\n• Return cleaning fee may apply if necessary",
    ];
    return terms[Math.floor(Math.random() * terms.length)];
  };

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getById(id);
        setProduct(response.data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Helper function to get product price
  const getProductPrice = (product) => {
    const dailyPricing = product?.pricingRules?.find(
      (rule) => rule.pricingType === "daily" && rule.isActive
    );
    return dailyPricing ? dailyPricing.basePrice : 0;
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product, index = 0) => {
    if (product?.images && product.images.length > 0) {
      const imageIndex = Math.min(index, product.images.length - 1);
      const imageName = product.images[imageIndex];
      // Convert .jpg to .svg for our placeholder images
      const svgImageName = imageName.replace(".jpg", ".svg");
      return `/images/products/${svgImageName}`;
    }
    return null;
  };

  // Helper function to get available inventory count
  const getAvailableInventoryCount = (product) => {
    return product?.inventory?.filter((item) => item.isAvailable)?.length || 0;
  };

  // Calculate rental duration in days
  const calculateRentalDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const duration = calculateRentalDuration(startDate, endDate);
    const dailyPrice = getProductPrice(product);
    return duration * dailyPrice * quantity;
  };

  // Validate rental dates
  const validateRentalDates = () => {
    if (!startDate || !endDate) {
      return {
        isValid: false,
        message: "Please select both start and end dates",
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return { isValid: false, message: "Start date cannot be in the past" };
    }

    if (end <= start) {
      return { isValid: false, message: "End date must be after start date" };
    }

    const duration = calculateRentalDuration(startDate, endDate);
    if (duration > 30) {
      return { isValid: false, message: "Maximum rental period is 30 days" };
    }

    return { isValid: true, message: "" };
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxQuantity = getAvailableInventoryCount(product) || 1;

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // Validate rental dates
    const validation = validateRentalDates();
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    // Check if product is available
    if (!product || !product.isActive) {
      toast.error("This product is currently unavailable");
      return;
    }

    // Check if there's available inventory
    const availableCount = getAvailableInventoryCount(product);
    if (availableCount === 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    // Check if requested quantity is available
    if (quantity > availableCount) {
      toast.error(
        `Only ${availableCount} unit${availableCount > 1 ? "s" : ""} available`
      );
      return;
    }

    setIsAddingToCart(true);

    try {
      // Simulate API call delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const duration = calculateRentalDuration(startDate, endDate);
      const totalCost = calculateTotalCost();

      // Add item to cart
      addItem(
        {
          id: product._id || product.id,
          name: product.name,
          price: getProductPrice(product),
          image: product.images?.[0] || null,
        },
        quantity,
        {
          start: startDate,
          end: endDate,
        }
      );

      // Show success state
      setAddToCartSuccess(true);

      // Show success message with details
      toast.success(
        `${product.name} added to cart! ${duration} day${
          duration > 1 ? "s" : ""
        } rental for ₹${totalCost.toLocaleString()}`,
        { duration: 4000 }
      );

      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    addToWishlist({
      productId: product._id || product.id,
      name: product.name,
      price: getProductPrice(product),
      image: product.images?.[0] || null,
    });
  };

  // Handle coupon apply
  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // Simulate coupon validation
      const validCoupons = ["SAVE10", "WELCOME20", "FIRST15", "BULK25"];
      if (validCoupons.includes(couponCode.toUpperCase())) {
        alert(
          `Coupon "${couponCode.toUpperCase()}" applied successfully! You'll see the discount at checkout.`
        );
        setCouponCode("");
      } else {
        alert("Invalid coupon code. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - RentEasy</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <nav className="flex items-center space-x-2 text-sm">
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  All Products
                </Link>
                <FiChevronRight className="text-gray-500" size={14} />
                <span className="text-white">{product.name}</span>
              </nav>

              {/* Price List Dropdown */}
              <div className="relative">
                <select className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm appearance-none pr-8 cursor-pointer">
                  <option value="standard">Price List</option>
                  <option value="bulk">Bulk Pricing</option>
                  <option value="weekly">Weekly Rates</option>
                  <option value="monthly">Monthly Rates</option>
                </select>
                <FiChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={12}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Image and Details */}
            <div className="space-y-6">
              {/* Product Image */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className="w-64 h-64 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center relative overflow-hidden mx-auto">
                  {getProductImageUrl(product, currentImageIndex) ? (
                    <img
                      src={getProductImageUrl(product, currentImageIndex)}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  {/* Fallback placeholder */}
                  <div
                    className="text-center"
                    style={{
                      display: getProductImageUrl(product, currentImageIndex)
                        ? "none"
                        : "block",
                    }}
                  >
                    <div className="w-20 h-24 bg-gray-600 rounded border border-gray-500 mx-auto mb-2 flex items-center justify-center relative">
                      {/* Bookmark/ribbon icon in corner */}
                      <div className="absolute -top-1 -right-1 w-6 h-8 bg-gray-500 rounded-sm flex items-center justify-center">
                        <div className="w-3 h-4 bg-gray-400 rounded-sm"></div>
                      </div>
                      <div className="text-2xl text-gray-400">📦</div>
                    </div>
                    <div className="text-xs text-gray-400">Product Image</div>
                  </div>

                  {/* Image Navigation */}
                  {product?.images && product.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev > 0 ? prev - 1 : product.images.length - 1
                          )
                        }
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev < product.images.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Thumbnails */}
                {product?.images && product.images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                          currentImageIndex === index
                            ? "border-blue-500"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <img
                          src={getProductImageUrl(product, index)}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add to Wishlist Button */}
              <button
                onClick={handleAddToWishlist}
                className={`w-full py-3 px-6 rounded-lg border-2 transition-colors ${
                  isInWishlist(product._id || product.id)
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-transparent border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                <FiHeart className="inline mr-2" size={18} />
                {isInWishlist(product._id || product.id)
                  ? "In Wishlist"
                  : "Add to wish list"}
              </button>

              {/* Product Descriptions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Product descriptions
                </h3>
                <div className="text-gray-300 space-y-2">
                  <p>{product.description || getRandomDescription()}</p>
                  {!showFullDescription && (
                    <>
                      <p className="text-gray-400">
                        Additional features include advanced safety mechanisms,
                        user-friendly controls, and comprehensive warranty
                        coverage.
                      </p>
                      <p className="text-gray-400">
                        Perfect for both beginners and professionals, with
                        detailed instruction manual and 24/7 customer support.
                      </p>
                      <p className="text-gray-400">
                        Environmentally friendly design with energy-efficient
                        operation and sustainable materials.
                      </p>
                    </>
                  )}
                  {showFullDescription && (
                    <>
                      <p className="text-gray-300">
                        This premium equipment features state-of-the-art
                        technology and has been thoroughly tested for
                        reliability and performance. Our rental service includes
                        comprehensive insurance coverage and technical support
                        throughout your rental period.
                      </p>
                      <p className="text-gray-300">
                        Specifications include industry-standard certifications,
                        multi-language user interface, and compatibility with
                        various accessories. Regular maintenance ensures optimal
                        performance and safety compliance.
                      </p>
                      <p className="text-gray-300">
                        Ideal for professional projects, events, and specialized
                        applications. Our team provides training and setup
                        assistance to ensure you get the most out of your rental
                        experience.
                      </p>

                      {/* Specifications */}
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          Key Specifications:
                        </h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Weight: 15-25 kg (varies by model)</li>
                          <li>• Dimensions: 60cm x 40cm x 30cm</li>
                          <li>
                            • Power Requirements: 220V AC / Battery operated
                          </li>
                          <li>• Operating Temperature: -10°C to +50°C</li>
                          <li>
                            • Certification: CE, ISO 9001, Safety Standards
                          </li>
                          <li>
                            • Warranty: Full coverage during rental period
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-400 hover:text-blue-300 mt-3 flex items-center gap-1"
                >
                  {showFullDescription ? "Read Less" : "Read More"}
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Column - Product Info and Actions */}
            <div className="space-y-6">
              {/* Product Name and Price */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">
                    ₹ {getProductPrice(product)}
                  </span>
                  <span className="text-gray-400">per day</span>
                </div>

                {/* Stock Availability */}
                <div className="mt-2">
                  {getAvailableInventoryCount(product) > 0 ? (
                    <span className="text-green-400 text-sm">
                      ✓ {getAvailableInventoryCount(product)} unit
                      {getAvailableInventoryCount(product) > 1 ? "s" : ""}{" "}
                      available
                    </span>
                  ) : (
                    <span className="text-red-400 text-sm">✗ Out of stock</span>
                  )}
                </div>

                {/* Rental Summary */}
                {startDate && endDate && (
                  <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Rental Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">
                          {calculateRentalDuration(startDate, endDate)} day
                          {calculateRentalDuration(startDate, endDate) > 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Rate:</span>
                        <span className="text-white">
                          ₹{getProductPrice(product).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="text-white">{quantity}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total Cost:</span>
                          <span className="text-green-400">
                            ₹{calculateTotalCost().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Picker */}
              <div className="space-y-4">
                <label className="block text-gray-300 font-medium">
                  Rental Period
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">From :</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                      <FiCalendar
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">to :</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                      <FiCalendar
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector and Add to Cart */}
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= getAvailableInventoryCount(product)}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addToCartSuccess}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    addToCartSuccess
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : isAddingToCart
                      ? "bg-blue-500 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Adding...
                    </>
                  ) : addToCartSuccess ? (
                    <>
                      <FiCheck className="text-white" size={18} />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="text-white" size={18} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Cart Navigation Options - Show after successful add */}
              {addToCartSuccess && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mt-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="text-green-400 text-sm">
                      ✓ Item added to cart successfully!
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate("/cart")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        View Cart
                      </button>
                      <button
                        onClick={() => navigate("/checkout")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Coupon */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Apply Coupon</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  Try:{" "}
                  <span
                    className="text-blue-400 cursor-pointer hover:text-blue-300"
                    onClick={() => setCouponCode("SAVE10")}
                  >
                    SAVE10
                  </span>
                  ,
                  <span
                    className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1"
                    onClick={() => setCouponCode("WELCOME20")}
                  >
                    WELCOME20
                  </span>
                  ,
                  <span
                    className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1"
                    onClick={() => setCouponCode("FIRST15")}
                  >
                    FIRST15
                  </span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Terms & condition
                </h3>
                <div className="text-gray-300 space-y-1">
                  {getRandomTerms()
                    .split("\n")
                    .map((term, index) => (
                      <p key={index} className="text-gray-400 text-sm">
                        {term}
                      </p>
                    ))}
                </div>
              </div>

              {/* Share */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiShare2 size={18} />
                  Share :
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const subject = `Check out this rental: ${product.name}`;
                      const body = `Hi there!

I found this great rental item that might interest you:

📦 ${product.name}
💰 ₹${getProductPrice(product)}/day

${
  product.description || "High-quality rental equipment perfect for your needs."
}

🔗 View Details: ${window.location.href}

Best regards!`;
                      window.location.href = `mailto:?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`;
                    }}
                    className="p-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                    title="Share via Email"
                  >
                    <FiMail className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`,
                        "_blank"
                      )
                    }
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                    title="Share on Facebook"
                  >
                    <FaFacebookF className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          window.location.href
                        )}&text=${encodeURIComponent(
                          `Check out this rental: ${product.name}`
                        )}`,
                        "_blank"
                      )
                    }
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center border border-gray-600"
                    title="Share on X (Twitter)"
                  >
                    <FaTwitter className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      window.open("https://www.instagram.com/", "_blank")
                    }
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors flex items-center justify-center"
                    title="Open Instagram"
                  >
                    <FaInstagram className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          window.location.href
                        )}`,
                        "_blank"
                      )
                    }
                    className="p-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center"
                    title="Share on LinkedIn"
                  >
                    <FaLinkedinIn className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(
                          `Check out this rental: ${product.name} - ${window.location.href}`
                        )}`,
                        "_blank"
                      )
                    }
                    className="p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center border border-gray-600"
                    title="Copy Link"
                  >
                    <FiCopy className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
