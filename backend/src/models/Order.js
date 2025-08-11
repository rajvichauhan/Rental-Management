const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  rentalStart: {
    type: Date,
    required: true
  },
  rentalEnd: {
    type: Date,
    required: true
  },
  pricingType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  }
});

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  items: [orderItemSchema],
  billingAddress: addressSchema,
  deliveryAddress: addressSchema,
  deliveryMethod: {
    type: String,
    enum: ['home_delivery', 'pickup'],
    default: 'home_delivery'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'bank_transfer'],
    default: 'card'
  },
  rentalStart: {
    type: Date,
    required: true
  },
  rentalEnd: {
    type: Date,
    required: true
  },
  actualPickup: {
    type: Date
  },
  actualReturn: {
    type: Date
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    min: 0,
    default: 0
  },
  depositAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  lateFees: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  appliedCoupon: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ rentalStart: 1, rentalEnd: 1 });

// Virtual for order duration
orderSchema.virtual('duration').get(function() {
  if (this.rentalStart && this.rentalEnd) {
    const diffTime = Math.abs(this.rentalEnd - this.rentalStart);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Duration in days
  }
  return 0;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((total, item) => {
      return total + (item.totalPrice || (item.unitPrice * item.quantity));
    }, 0);

    // Calculate total amount
    this.totalAmount = this.subtotal + this.taxAmount + this.deliveryCharge - this.discountAmount;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
