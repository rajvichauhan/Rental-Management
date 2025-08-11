import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiHeart,
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiCalendar,
  FiShare2,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram
} from 'react-icons/fa';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Random product descriptions
  const getRandomDescription = () => {
    const descriptions = [
      "High-quality professional equipment perfect for your rental needs. Built with durability and performance in mind, this product offers exceptional value for both short-term and long-term rentals.",
      "Premium grade equipment designed for heavy-duty use. Features advanced technology and robust construction to ensure reliable performance in demanding environments.",
      "Versatile and user-friendly equipment suitable for various applications. Easy to operate with comprehensive safety features and excellent build quality.",
      "State-of-the-art equipment with cutting-edge features. Ideal for professional use with superior performance characteristics and modern design.",
      "Reliable and efficient equipment perfect for commercial and residential applications. Engineered for optimal performance with minimal maintenance requirements."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // Random terms and conditions
  const getRandomTerms = () => {
    const terms = [
      "• Rental period minimum 1 day, maximum 30 days\n• Security deposit required for all rentals\n• Equipment must be returned in original condition\n• Late return fees apply after grace period\n• Damage assessment charges may apply\n• Renter responsible for equipment during rental period",
      "• Valid ID and contact information required\n• Equipment inspection required before and after rental\n• No subletting or transfer of rental agreement\n• Cancellation policy: 24 hours notice required\n• Insurance coverage recommended for high-value items\n• Technical support available during business hours",
      "• Delivery and pickup services available for additional fee\n• Equipment training provided if required\n• Maintenance and repairs covered during rental period\n• Replacement equipment provided in case of malfunction\n• Rental extensions subject to availability\n• Payment due before equipment release",
      "• Professional use only for commercial grade equipment\n• Safety guidelines must be followed at all times\n• Regular maintenance checks required for long-term rentals\n• Environmental conditions may affect rental terms\n• Liability insurance required for certain equipment\n• Return cleaning fee may apply if necessary"
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
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
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

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory?.available || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      alert('Please select rental dates');
      return;
    }

    addItem(
      {
        id: product._id || product.id,
        name: product.name,
        price: getProductPrice(product),
        image: product.images?.[0] || null
      },
      quantity,
      {
        start: startDate,
        end: endDate
      }
    );
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    addToWishlist({
      productId: product._id || product.id,
      name: product.name,
      price: getProductPrice(product),
      image: product.images?.[0] || null
    });
  };

  // Handle coupon apply
  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // Simulate coupon validation
      const validCoupons = ['SAVE10', 'WELCOME20', 'FIRST15', 'BULK25'];
      if (validCoupons.includes(couponCode.toUpperCase())) {
        alert(`Coupon "${couponCode.toUpperCase()}" applied successfully! You'll see the discount at checkout.`);
        setCouponCode('');
      } else {
        alert('Invalid coupon code. Please try again.');
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
          <p className="text-red-400 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/products')}
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
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
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
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Image and Details */}
            <div className="space-y-6">
              {/* Product Image */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 flex items-center justify-center">
                <div className="w-64 h-64 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center relative">
                  {/* Placeholder image with product icon */}
                  <div className="text-center">
                    <div className="w-20 h-24 bg-gray-600 rounded border border-gray-500 mx-auto mb-2 flex items-center justify-center relative">
                      {/* Bookmark/ribbon icon in corner */}
                      <div className="absolute -top-1 -right-1 w-6 h-8 bg-gray-500 rounded-sm flex items-center justify-center">
                        <div className="w-3 h-4 bg-gray-400 rounded-sm"></div>
                      </div>
                      <div className="text-2xl text-gray-400">📦</div>
                    </div>
                    <div className="text-xs text-gray-400">Product Image</div>
                  </div>
                </div>
              </div>

              {/* Add to Wishlist Button */}
              <button
                onClick={handleAddToWishlist}
                className={`w-full py-3 px-6 rounded-lg border-2 transition-colors ${
                  isInWishlist(product._id || product.id)
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                <FiHeart className="inline mr-2" size={18} />
                {isInWishlist(product._id || product.id) ? 'In Wishlist' : 'Add to wish list'}
              </button>

              {/* Product Descriptions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Product descriptions</h3>
                <div className="text-gray-300 space-y-2">
                  <p>{product.description || getRandomDescription()}</p>
                  {!showFullDescription && (
                    <>
                      <p className="text-gray-400">Additional features include advanced safety mechanisms, user-friendly controls, and comprehensive warranty coverage.</p>
                      <p className="text-gray-400">Perfect for both beginners and professionals, with detailed instruction manual and 24/7 customer support.</p>
                      <p className="text-gray-400">Environmentally friendly design with energy-efficient operation and sustainable materials.</p>
                    </>
                  )}
                  {showFullDescription && (
                    <>
                      <p className="text-gray-300">This premium equipment features state-of-the-art technology and has been thoroughly tested for reliability and performance. Our rental service includes comprehensive insurance coverage and technical support throughout your rental period.</p>
                      <p className="text-gray-300">Specifications include industry-standard certifications, multi-language user interface, and compatibility with various accessories. Regular maintenance ensures optimal performance and safety compliance.</p>
                      <p className="text-gray-300">Ideal for professional projects, events, and specialized applications. Our team provides training and setup assistance to ensure you get the most out of your rental experience.</p>

                      {/* Specifications */}
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Key Specifications:</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Weight: 15-25 kg (varies by model)</li>
                          <li>• Dimensions: 60cm x 40cm x 30cm</li>
                          <li>• Power Requirements: 220V AC / Battery operated</li>
                          <li>• Operating Temperature: -10°C to +50°C</li>
                          <li>• Certification: CE, ISO 9001, Safety Standards</li>
                          <li>• Warranty: Full coverage during rental period</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-400 hover:text-blue-300 mt-3 flex items-center gap-1"
                >
                  {showFullDescription ? 'Read Less' : 'Read More'}
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Column - Product Info and Actions */}
            <div className="space-y-6">
              {/* Product Name and Price */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">₹ {getProductPrice(product)}</span>
                  <span className="text-gray-400">( ₹{Math.round(getProductPrice(product) * 0.5)} / per unit )</span>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-4">
                <label className="block text-gray-300 font-medium">Rental Period</label>
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
                      <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
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
                      <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
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
                    disabled={quantity >= (product?.inventory?.available || 10)}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="text-white" size={18} />
                  Add to Cart
                </button>
              </div>

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
                  Try: <span className="text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => setCouponCode('SAVE10')}>SAVE10</span>,
                  <span className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1" onClick={() => setCouponCode('WELCOME20')}>WELCOME20</span>,
                  <span className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1" onClick={() => setCouponCode('FIRST15')}>FIRST15</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Terms & condition</h3>
                <div className="text-gray-300 space-y-1">
                  {getRandomTerms().split('\n').map((term, index) => (
                    <p key={index} className="text-gray-400 text-sm">{term}</p>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiShare2 size={18} />
                  Share :
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                    title="Share on Facebook"
                  >
                    <FaFacebookF className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this rental: ${product.name}`)}`, '_blank')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center border border-gray-600"
                    title="Share on X (Twitter)"
                  >
                    <FaTwitter className="text-white" size={16} />
                  </button>
                  <button
                    onClick={() => {
                      // Instagram doesn't have a direct share URL, so we'll copy the link
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard! You can now share it on Instagram.');
                    }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors flex items-center justify-center"
                    title="Copy link for Instagram"
                  >
                    <FaInstagram className="text-white" size={16} />
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
