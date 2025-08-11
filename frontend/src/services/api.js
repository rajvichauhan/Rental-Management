import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle specific error status codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        // Show error message from server or generic message
        const message = data?.message || 'An unexpected error occurred.';
        toast.error(message);
        break;
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateMe: (userData) => api.patch('/auth/update-me', userData),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', email),
};

// Products API endpoints
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.patch(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (categoryId, params) => api.get(`/products/categories/${categoryId}`, { params }),
  checkAvailability: (id, params) => api.get(`/products/${id}/availability`, { params }),
  getPricing: (id) => api.get(`/products/${id}/pricing`),
  getSimilar: (id) => api.get(`/products/${id}/similar`),
  getInventory: (id) => api.get(`/products/${id}/inventory`),
  addInventory: (id, inventoryData) => api.post(`/products/${id}/inventory`, inventoryData),
  updateInventory: (id, inventoryId, inventoryData) => api.patch(`/products/${id}/inventory/${inventoryId}`, inventoryData),
  removeInventory: (id, inventoryId) => api.delete(`/products/${id}/inventory/${inventoryId}`),
  addPricing: (id, pricingData) => api.post(`/products/${id}/pricing`, pricingData),
  updatePricing: (id, ruleId, pricingData) => api.patch(`/products/${id}/pricing/${ruleId}`, pricingData),
  deletePricing: (id, ruleId) => api.delete(`/products/${id}/pricing/${ruleId}`),
  bulkUpdate: (updateData) => api.post('/products/bulk/update', updateData),
  bulkDelete: (productIds) => api.post('/products/bulk/delete', { productIds }),
  getAnalytics: (id) => api.get(`/products/${id}/analytics`),
};

// Categories API endpoints
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  getTree: () => api.get('/categories/tree'),
};

// Orders API endpoints
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.patch(`/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/${id}`),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  processPickup: (id, pickupData) => api.post(`/orders/${id}/pickup`, pickupData),
  processReturn: (id, returnData) => api.post(`/orders/${id}/return`, returnData),
  calculateLateFees: (id) => api.get(`/orders/${id}/late-fees`),
  generateContract: (id) => api.get(`/orders/${id}/contract`),
  generateInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

// Quotations API endpoints
export const quotationsAPI = {
  getAll: (params) => api.get('/quotations', { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (quotationData) => api.post('/quotations', quotationData),
  update: (id, quotationData) => api.patch(`/quotations/${id}`, quotationData),
  delete: (id) => api.delete(`/quotations/${id}`),
  convertToOrder: (id) => api.post(`/quotations/${id}/convert`),
  sendToCustomer: (id) => api.post(`/quotations/${id}/send`),
  getMyQuotations: (params) => api.get('/quotations/my-quotations', { params }),
};

// Payments API endpoints
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  createPaymentIntent: (orderData) => api.post('/payments/create-intent', orderData),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  processRefund: (paymentId, amount) => api.post(`/payments/${paymentId}/refund`, { amount }),
  getOrderPayments: (orderId) => api.get(`/payments/order/${orderId}`),
  webhook: (data) => api.post('/payments/webhook', data),
};

// Users API endpoints
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  getAddresses: (id) => api.get(`/users/${id}/addresses`),
  addAddress: (id, addressData) => api.post(`/users/${id}/addresses`, addressData),
  updateAddress: (id, addressId, addressData) => api.patch(`/users/${id}/addresses/${addressId}`, addressData),
  deleteAddress: (id, addressId) => api.delete(`/users/${id}/addresses/${addressId}`),
};

// Notifications API endpoints
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  subscribe: (subscriptionData) => api.post('/notifications/subscribe', subscriptionData),
  unsubscribe: (subscriptionId) => api.delete(`/notifications/subscribe/${subscriptionId}`),
};

// Reports API endpoints
export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getProductReport: (params) => api.get('/reports/products', { params }),
  getCustomerReport: (params) => api.get('/reports/customers', { params }),
  getInventoryReport: () => api.get('/reports/inventory'),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

// Upload API endpoints
export const uploadAPI = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files, type = 'general') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
};

export default api;
