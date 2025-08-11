# Rental Management System - API Documentation

This document provides an overview of the REST API endpoints available in the Rental Management System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "status": "success|error",
  "message": "Human readable message",
  "data": {
    // Response data
  }
}
```

## Error Handling

Error responses include appropriate HTTP status codes and error messages:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/logout
Logout current user (client-side token removal).

#### GET /auth/me
Get current user information (requires authentication).

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

### Product Endpoints

#### GET /products
Get all products with optional filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category ID
- `search` - Search in product name/description
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `available` - Filter by availability
- `sortBy` - Sort field (name, price, created_at)
- `sortOrder` - Sort direction (asc, desc)

#### GET /products/:id
Get single product by ID.

#### POST /products
Create new product (admin/staff only).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "categoryId": "category-uuid",
  "sku": "PROD-001",
  "brand": "Brand Name",
  "model": "Model Name",
  "condition": "excellent",
  "replacementValue": 1000.00,
  "requiresDeposit": true,
  "depositAmount": 100.00,
  "minRentalPeriod": 24,
  "maxRentalPeriod": 720,
  "advanceBookingDays": 7,
  "lateFeePerDay": 25.00
}
```

#### PATCH /products/:id
Update product (admin/staff only).

#### DELETE /products/:id
Delete product (admin/staff only).

#### GET /products/:id/availability
Check product availability for specific date range.

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `quantity` - Required quantity (default: 1)

#### GET /products/:id/pricing
Get pricing rules for product.

### Category Endpoints

#### GET /categories
Get all categories.

#### GET /categories/:id
Get single category by ID.

#### POST /categories
Create new category (admin/staff only).

#### PATCH /categories/:id
Update category (admin/staff only).

#### DELETE /categories/:id
Delete category (admin/staff only).

### Order Endpoints

#### GET /orders
Get all orders (admin/staff) or user's orders (customers).

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by order status
- `startDate` - Filter by date range
- `endDate` - Filter by date range

#### GET /orders/:id
Get single order by ID.

#### POST /orders
Create new order.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 1,
      "rentalStart": "2023-07-01T10:00:00Z",
      "rentalEnd": "2023-07-03T10:00:00Z"
    }
  ],
  "pickupAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "returnAddress": {
    // Same format as pickup address
  },
  "notes": "Special instructions"
}
```

#### PATCH /orders/:id
Update order.

#### PATCH /orders/:id/status
Update order status (admin/staff only).

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### POST /orders/:id/pickup
Process order pickup (admin/staff only).

#### POST /orders/:id/return
Process order return (admin/staff only).

### Payment Endpoints

#### POST /payments/create-intent
Create Stripe payment intent for order.

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "amount": 100.00,
  "currency": "USD"
}
```

#### POST /payments/confirm
Confirm payment completion.

**Request Body:**
```json
{
  "paymentIntentId": "pi_stripe_payment_intent_id"
}
```

#### GET /payments/order/:orderId
Get all payments for specific order.

#### POST /payments/:id/refund
Process payment refund (admin/staff only).

### User Management Endpoints (Admin/Staff Only)

#### GET /users
Get all users with pagination and filtering.

#### GET /users/:id
Get single user by ID.

#### POST /users
Create new user.

#### PATCH /users/:id
Update user.

#### DELETE /users/:id
Delete user.

#### PATCH /users/:id/role
Update user role.

### Notification Endpoints

#### GET /notifications
Get user's notifications.

#### PATCH /notifications/:id/read
Mark notification as read.

#### PATCH /notifications/mark-all-read
Mark all notifications as read.

#### DELETE /notifications/:id
Delete notification.

### Report Endpoints (Admin/Staff Only)

#### GET /reports/dashboard
Get dashboard statistics.

#### GET /reports/revenue
Get revenue report with date filtering.

#### GET /reports/products
Get product performance report.

#### GET /reports/customers
Get customer analytics report.

#### GET /reports/inventory
Get inventory status report.

#### GET /reports/export/:type
Export report in specified format (PDF, XLSX, CSV).

### File Upload Endpoints

#### POST /upload
Upload single file.

**Request:** Multipart form data with `file` field.

#### POST /upload/multiple
Upload multiple files.

**Request:** Multipart form data with `files` field.

#### DELETE /upload/:filename
Delete uploaded file.

## Rate Limiting

API endpoints are rate limited:
- Authentication endpoints: 5 requests per 15 minutes per IP
- General endpoints: 100 requests per 15 minutes per IP

## Pagination

List endpoints support pagination with these parameters:
- `page` - Page number (starts from 1)
- `limit` - Items per page (max 100)

Response includes pagination metadata:
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks

### Stripe Webhook
Endpoint: `POST /payments/webhook`

Handles Stripe payment events for order processing.

## Testing

Use the provided Postman collection or access the interactive API documentation at:
```
http://localhost:5000/api/docs
```

## SDK and Libraries

For JavaScript/Node.js applications, you can use the provided API service:

```javascript
import { productsAPI, ordersAPI } from './services/api';

// Get products
const products = await productsAPI.getAll({ page: 1, limit: 20 });

// Create order
const order = await ordersAPI.create(orderData);
```
