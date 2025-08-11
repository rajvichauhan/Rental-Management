# Role System Update Test Plan

## Changes Made

### Backend Changes
1. ✅ Updated User model schema to use roles: ['customer', 'vendor'] with 'customer' as default
2. ✅ Updated authentication middleware to use 'vendor' instead of 'admin'/'staff'
3. ✅ Updated route protection in orders.js to use restrictTo('vendor')
4. ✅ Updated mongodb-server.js registration to accept role parameter
5. ✅ Updated README.md to reflect new role system

### Frontend Changes
1. ✅ Updated AuthContext to replace isAdminOrStaff() with isVendor()
2. ✅ Created new VendorDashboardPage based on provided design
3. ✅ Updated App.js routing to redirect vendors to /vendor-dashboard
4. ✅ Updated ProtectedRoute to use new vendor role system
5. ✅ Updated Header component to use isVendor instead of isAdminOrStaff
6. ✅ Updated RegisterPage to include role selection

## Testing Steps

### 1. Test User Registration
- [ ] Register a new customer account
- [ ] Register a new vendor account
- [ ] Verify roles are saved correctly in database

### 2. Test Authentication & Routing
- [ ] Login as customer - should redirect to /dashboard
- [ ] Login as vendor - should redirect to /vendor-dashboard
- [ ] Test role-based access control

### 3. Test Vendor Dashboard
- [ ] Access vendor dashboard as vendor user
- [ ] Verify dashboard displays correctly with stats and tables
- [ ] Test navigation between vendor pages

### 4. Test Access Control
- [ ] Try accessing vendor routes as customer (should be blocked)
- [ ] Try accessing customer routes as vendor (should work)
- [ ] Test API endpoints with new role system

### 5. Test Legacy Admin Routes
- [ ] Verify /admin routes now require vendor role
- [ ] Test existing admin functionality with vendor role

## Expected Behavior

### Customer Users
- Default role on registration
- Access to: /dashboard, /orders, /profile, /checkout
- Cannot access: /vendor-dashboard, /admin routes

### Vendor Users
- Can be selected during registration
- Access to: /vendor-dashboard, /admin routes (legacy), all customer routes
- Full management capabilities (products, orders, reports)

## Database Migration Notes

Existing users with 'admin' or 'staff' roles will need to be manually updated to 'vendor' role:

```javascript
// MongoDB update command
db.users.updateMany(
  { role: { $in: ['admin', 'staff'] } },
  { $set: { role: 'vendor' } }
)
```

## Files Modified

### Backend
- `backend/src/models/User.js`
- `backend/src/middleware/auth.js`
- `backend/src/routes/orders.js`
- `backend/mongodb-server.js`

### Frontend
- `frontend/src/contexts/AuthContext.js`
- `frontend/src/App.js`
- `frontend/src/components/ProtectedRoute.js`
- `frontend/src/components/Layout/Header.js`
- `frontend/src/pages/auth/RegisterPage.js`
- `frontend/src/pages/VendorDashboardPage.js` (new)

### Documentation
- `README.md`
