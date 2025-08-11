import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  total: 0,
  isOpen: false,
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  LOAD_CART: 'LOAD_CART',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity, rentalDates } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && 
                 item.rentalDates.start === rentalDates.start &&
                 item.rentalDates.end === rentalDates.end
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...state.items,
          {
            id: `${product.id}-${rentalDates.start}-${rentalDates.end}`,
            product,
            quantity,
            rentalDates,
            price: product.price || 0,
          }
        ];
      }

      const newTotal = calculateTotal(newItems);
      return { ...state, items: newItems, total: newTotal };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotal = calculateTotal(newItems);
      return { ...state, items: newItems, total: newTotal };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      
      const newTotal = calculateTotal(newItems);
      return { ...state, items: newItems, total: newTotal };
    }

    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [], total: 0 };

    case CART_ACTIONS.TOGGLE_CART:
      return { ...state, isOpen: !state.isOpen };

    case CART_ACTIONS.LOAD_CART:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    return total + itemTotal;
  }, 0);
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total
    }));
  }, [state.items, state.total]);

  // Add item to cart
  const addItem = (product, quantity = 1, rentalDates) => {
    if (!rentalDates || !rentalDates.start || !rentalDates.end) {
      toast.error('Please select rental dates');
      return;
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity, rentalDates }
    });

    toast.success(`${product.name} added to cart`);
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: itemId });
    toast.success('Item removed from cart');
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 0) return;
    
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity }
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Cart cleared');
  };

  // Toggle cart visibility
  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  // Get cart item count
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId, rentalDates) => {
    return state.items.some(
      item => item.product.id === productId &&
               item.rentalDates.start === rentalDates?.start &&
               item.rentalDates.end === rentalDates?.end
    );
  };

  // Get item from cart
  const getCartItem = (productId, rentalDates) => {
    return state.items.find(
      item => item.product.id === productId &&
               item.rentalDates.start === rentalDates?.start &&
               item.rentalDates.end === rentalDates?.end
    );
  };

  // Calculate rental duration in days
  const calculateRentalDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate item subtotal
  const calculateItemSubtotal = (item) => {
    const duration = calculateRentalDuration(
      item.rentalDates.start,
      item.rentalDates.end
    );
    return item.price * item.quantity * duration;
  };

  // Get cart summary
  const getCartSummary = () => {
    const subtotal = state.items.reduce((total, item) => {
      return total + calculateItemSubtotal(item);
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: getItemCount()
    };
  };

  const value = {
    cartItems: state.items,
    cartTotal: state.total,
    isCartOpen: state.isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getItemCount,
    isInCart,
    getCartItem,
    calculateRentalDuration,
    calculateItemSubtotal,
    getCartSummary,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
