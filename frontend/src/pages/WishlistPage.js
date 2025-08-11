import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item) => {
    // For wishlist items, we'll need to prompt for rental dates
    // For now, let's redirect to the product detail page
    window.location.href = `/products/${item.productId}`;
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  return (
    <>
      <Helmet>
        <title>Wishlist - RentEasy</title>
        <meta
          name="description"
          content="Your saved rental products and equipment."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <FiHeart className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <FiHeart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.productId} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-700 flex items-center justify-center border-b border-gray-600 relative">
                    <div className="w-16 h-16 bg-gray-600 rounded border-2 border-gray-500 flex items-center justify-center">
                      <div className="text-xs text-gray-400 text-center">
                        <div className="mb-1">📊</div>
                        <div>IMG</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-80 rounded-full text-red-500 hover:bg-opacity-100 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${item.productId}`} className="block">
                      <h3 className="text-white font-medium mb-2 hover:text-blue-400 transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-gray-300 text-lg font-semibold mb-3">₹{item.price.toFixed(2)}/day</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;
