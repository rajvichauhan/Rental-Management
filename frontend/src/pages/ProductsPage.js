import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiChevronDown,
  FiShoppingCart,
  FiHeart,
  FiImage,
} from "react-icons/fi";
import { productsAPI, categoriesAPI } from "../services/api";
import { useWishlist } from "../contexts/WishlistContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const ProductsPage = () => {
  const { addToWishlist, isInWishlist } = useWishlist();

  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        const categoriesData = [
          { _id: "all", name: "All Categories" },
          ...response.data.data,
        ];
        setCategories(categoriesData);
      } catch (error) {
        console.log("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder,
        };

        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        if (searchTerm) {
          params.search = searchTerm;
        }

        // Add price range filtering based on replacement value
        if (priceRange !== "all") {
          switch (priceRange) {
            case "low":
              params.maxPrice = 50;
              break;
            case "medium":
              params.minPrice = 50;
              params.maxPrice = 200;
              break;
            case "high":
              params.minPrice = 200;
              break;
          }
        }

        const response = await productsAPI.getAll(params);
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    selectedCategory,
    searchTerm,
    sortBy,
    sortOrder,
    priceRange,
  ]);

  const colors = ["-", "-", "-", "-"];
  const priceRanges = ["-", "-", "-", "-"];

  // Helper function to get product daily rental price
  const getProductPrice = (product) => {
    const dailyPricing = product.pricingRules?.find(
      (rule) => rule.pricingType === "daily" && rule.isActive
    );
    return dailyPricing ? dailyPricing.basePrice : 0;
  };

  // Helper function to get product image
  const getProductImage = (product, isHover = false) => {
    // Check if product has images array
    if (product.images && product.images.length > 0) {
      if (isHover && product.images.length > 1) {
        return product.images[1]; // Show second image on hover
      }
      return product.images[0];
    }

    // Fallback images based on product name or category
    const productName = product.name?.toLowerCase() || "";
    const categoryName = product.category?.name?.toLowerCase() || "";

    // Map specific products to available images with hover variants
    if (productName.includes("chair") || categoryName.includes("chair")) {
      return isHover ? "/chair2.jpg" : "/chair1.jpg";
    }

    // Default fallback images for different categories with hover variants
    const categoryImageMap = {
      furniture: isHover ? "/chair1.jpg" : "/chair2.jpg",
      electronics: isHover ? "/chair2.jpg" : "/chair1.jpg",
      appliances: isHover ? "/chair1.jpg" : "/chair2.jpg",
      tools: isHover ? "/chair2.jpg" : "/chair1.jpg",
      sports: isHover ? "/chair1.jpg" : "/chair2.jpg",
      automotive: isHover ? "/chair2.jpg" : "/chair1.jpg",
    };

    return (
      categoryImageMap[categoryName] ||
      (isHover ? "/chair2.jpg" : "/chair1.jpg")
    );
  };

  // Helper function to handle image loading errors
  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  // Handle sort change
  const handleSortChange = (value) => {
    switch (value) {
      case "name":
        setSortBy("name");
        setSortOrder("asc");
        break;
      case "price-low":
        setSortBy("replacementValue");
        setSortOrder("asc");
        break;
      case "price-high":
        setSortBy("replacementValue");
        setSortOrder("desc");
        break;
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      default:
        setSortBy("name");
        setSortOrder("asc");
    }
  };

  // Get current sort value for dropdown
  const getCurrentSortValue = () => {
    if (sortBy === "name") return "name";
    if (sortBy === "replacementValue" && sortOrder === "asc")
      return "price-low";
    if (sortBy === "replacementValue" && sortOrder === "desc")
      return "price-high";
    if (sortBy === "createdAt" && sortOrder === "desc") return "newest";
    return "name";
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("name");
    setSortOrder("asc");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle add to wishlist
  const handleAddToWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    addToWishlist({
      productId: product._id || product.id,
      name: product.name,
      price: getProductPrice(product),
      image: getProductImage(product),
    });
  };

  return (
    <>
      <Helmet>
        <title>Rental Shop - RentEasy</title>
        <meta
          name="description"
          content="Browse our extensive collection of rental products and equipment."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Category Navigation */}
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-6 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category._id
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  Product attributes
                </h3>

                {/* Colors Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 text-gray-300">
                    Colors
                  </h4>
                  <div className="space-y-2">
                    {colors.map((color, index) => (
                      <div key={index} className="text-gray-400 text-sm">
                        {color}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-300">
                    Price range
                  </h4>
                  <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <div key={index} className="text-gray-400 text-sm">
                        {range}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Controls */}
              <div className="flex items-center gap-4 mb-6">
                {/* Price List Dropdown */}
                <div className="relative">
                  <select
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none pr-8"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="all">Price List</option>
                    <option value="low">$0 - $50</option>
                    <option value="medium">$50 - $200</option>
                    <option value="high">$200+</option>
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Search Bar */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none pr-8 focus:outline-none focus:border-blue-500"
                    value={getCurrentSortValue()}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="name">📝 Name A-Z</option>
                    <option value="price-low">💰 Value: Low to High</option>
                    <option value="price-high">💰 Value: High to Low</option>
                    <option value="newest">🆕 Newest First</option>
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-800 border border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FiGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FiList size={20} />
                  </button>
                </div>

                {/* Clear Filters Button */}
                {(selectedCategory !== "all" ||
                  priceRange !== "all" ||
                  searchTerm ||
                  sortBy !== "name" ||
                  sortOrder !== "asc") && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <LoadingSpinner size="large" />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">No products found</p>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                      : "space-y-4 mb-8"
                  }
                >
                  {products.map((product) =>
                    viewMode === "grid" ? (
                      // Grid View
                      <div
                        key={product._id || product.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors group"
                        onMouseEnter={() =>
                          setHoveredProduct(product._id || product.id)
                        }
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        {/* Clickable Product Area */}
                        <Link
                          to={`/products/${product._id || product.id}`}
                          className="block cursor-pointer"
                        >
                          {/* Product Image */}
                          <div className="w-full h-48 bg-gray-700 flex items-center justify-center border-b border-gray-600 group-hover:bg-gray-650 transition-colors relative overflow-hidden">
                            <img
                              src={getProductImage(
                                product,
                                hoveredProduct === (product._id || product.id)
                              )}
                              alt={product.name}
                              className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                              onError={handleImageError}
                            />
                            {/* Fallback placeholder */}
                            <div
                              className="absolute inset-0 bg-gray-700 flex items-center justify-center"
                              style={{ display: "none" }}
                            >
                              <div className="text-center text-gray-400">
                                <FiImage size={32} className="mx-auto mb-2" />
                                <div className="text-xs">No Image</div>
                              </div>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-4 pb-2">
                            <h3 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {product.description ||
                                "No description available"}
                            </p>
                            <div className="mb-3">
                              <p className="text-gray-300 text-lg font-semibold">
                                ₹{getProductPrice(product).toFixed(2)}/day
                              </p>
                              <p className="text-gray-500 text-xs">
                                Value: ₹
                                {(product.replacementValue || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Link>

                        {/* Action Buttons - Outside Link to prevent nested clickable elements */}
                        <div className="px-4 pb-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/products/${product._id || product.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <FiShoppingCart size={16} />
                              Add to Cart
                            </Link>
                            <button
                              onClick={(e) => handleAddToWishlist(product, e)}
                              className={`p-2 rounded transition-colors ${
                                isInWishlist(product._id || product.id)
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                              }`}
                            >
                              <FiHeart size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div
                        key={product._id || product.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors group"
                        onMouseEnter={() =>
                          setHoveredProduct(product._id || product.id)
                        }
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        <div className="flex items-center gap-4 p-4">
                          {/* Clickable Product Area */}
                          <Link
                            to={`/products/${product._id || product.id}`}
                            className="flex items-center gap-4 flex-1 cursor-pointer"
                          >
                            {/* Product Image */}
                            <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-650 transition-colors relative overflow-hidden">
                              <img
                                src={getProductImage(
                                  product,
                                  hoveredProduct === (product._id || product.id)
                                )}
                                alt={product.name}
                                className="w-full h-full object-cover object-center rounded-lg transition-all duration-300 group-hover:scale-105"
                                onError={handleImageError}
                              />
                              {/* Fallback placeholder */}
                              <div
                                className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center"
                                style={{ display: "none" }}
                              >
                                <div className="text-center text-gray-400">
                                  <FiImage size={20} className="mx-auto mb-1" />
                                  <div className="text-xs">No Image</div>
                                </div>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                                {product.description ||
                                  "No description available"}
                              </p>
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-gray-300 text-lg font-semibold">
                                    ₹{getProductPrice(product).toFixed(2)}/day
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    Value: ₹
                                    {(product.replacementValue || 0).toFixed(2)}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                  SKU: {product.sku || "N/A"}
                                </span>
                              </div>
                            </div>
                          </Link>

                          {/* Action Buttons - Outside Link to prevent nested clickable elements */}
                          <div className="flex gap-2 flex-shrink-0">
                            <Link
                              to={`/products/${product._id || product.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <FiShoppingCart size={16} />
                              Add to Cart
                            </Link>
                            <button
                              onClick={(e) => handleAddToWishlist(product, e)}
                              className={`p-2 rounded transition-colors ${
                                isInWishlist(product._id || product.id)
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                              }`}
                            >
                              <FiHeart size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    &lt;
                  </button>
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        className="w-8 h-8 rounded text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => setCurrentPage(pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                  <button
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
