import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CheckoutPage from '../CheckoutPage';
import { CartProvider } from '../../contexts/CartContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Mock the API modules
jest.mock('../../services/api', () => ({
  ordersAPI: {
    create: jest.fn(() => Promise.resolve({ data: { data: { id: 'test-order-id' } } }))
  },
  paymentsAPI: {
    createPaymentIntent: jest.fn(() => Promise.resolve({ data: { paymentIntentId: 'test-intent-id' } })),
    confirmPayment: jest.fn(() => Promise.resolve())
  }
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </BrowserRouter>
);

// Mock cart items
const mockCartItems = [
  {
    id: '1',
    product: {
      id: 'product-1',
      name: 'Test Product',
      image: '/test-image.jpg'
    },
    quantity: 2,
    price: 100,
    rentalDates: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-03T00:00:00Z'
    }
  }
];

// Mock user
const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890'
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    // Mock cart context
    jest.spyOn(require('../../contexts/CartContext'), 'useCart').mockReturnValue({
      cartItems: mockCartItems,
      getCartSummary: () => ({
        subtotal: 400,
        tax: 40,
        total: 440,
        itemCount: 2
      }),
      calculateRentalDuration: (start, end) => 2,
      calculateItemSubtotal: (item) => 400,
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn()
    });

    // Mock auth context
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders checkout page with order review step', () => {
    render(
      <TestWrapper>
        <CheckoutPage />
      </TestWrapper>
    );

    expect(screen.getByText('Review Your Order')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  test('navigates through checkout steps without validation', async () => {
    render(
      <TestWrapper>
        <CheckoutPage />
      </TestWrapper>
    );

    // Should start at step 1 (Review Order)
    expect(screen.getByText('Review Your Order')).toBeInTheDocument();

    // Click continue to delivery - should proceed without validation
    const continueButton = screen.getByText('Continue to Delivery');
    fireEvent.click(continueButton);

    // Should navigate to delivery step without validation errors
    await waitFor(() => {
      expect(screen.getByText('Delivery Information')).toBeInTheDocument();
    });
  });

  test('allows order placement without form validation', async () => {
    render(
      <TestWrapper>
        <CheckoutPage />
      </TestWrapper>
    );

    // Navigate to payment step
    const continueButton = screen.getByText('Continue to Delivery');
    fireEvent.click(continueButton);

    await waitFor(() => {
      const continueToPayment = screen.getByText('Continue to Payment');
      fireEvent.click(continueToPayment);
    });

    // Should be able to place order without filling any forms
    await waitFor(() => {
      const placeOrderButton = screen.getByText('Place Order');
      expect(placeOrderButton).toBeInTheDocument();
      expect(placeOrderButton).not.toBeDisabled();
    });
  });

  test('applies coupon code successfully', async () => {
    render(
      <TestWrapper>
        <CheckoutPage />
      </TestWrapper>
    );

    // Find coupon input and apply button
    const couponInput = screen.getByPlaceholderText('Coupon Code');
    const applyButton = screen.getByText('Apply');

    // Enter valid coupon code
    fireEvent.change(couponInput, { target: { value: 'SAVE10' } });
    fireEvent.click(applyButton);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Coupon SAVE10 applied successfully/)).toBeInTheDocument();
    });
  });

  test('handles quantity updates', () => {
    const mockUpdateQuantity = jest.fn();
    
    jest.spyOn(require('../../contexts/CartContext'), 'useCart').mockReturnValue({
      cartItems: mockCartItems,
      getCartSummary: () => ({
        subtotal: 400,
        tax: 40,
        total: 440,
        itemCount: 2
      }),
      calculateRentalDuration: (start, end) => 2,
      calculateItemSubtotal: (item) => 400,
      updateQuantity: mockUpdateQuantity,
      removeItem: jest.fn(),
      clearCart: jest.fn()
    });

    render(
      <TestWrapper>
        <CheckoutPage />
      </TestWrapper>
    );

    // Find quantity increase button
    const increaseButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(increaseButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);
  });
});
