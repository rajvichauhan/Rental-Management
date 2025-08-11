const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  replacementValue: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresDeposit: {
    type: Boolean,
    default: false
  },
  depositAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  minRentalPeriod: {
    type: Number, // in hours
    default: 1,
    min: 1
  },
  maxRentalPeriod: {
    type: Number, // in hours
    min: 1
  },
  advanceBookingDays: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeePerDay: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [{
    type: String
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed
  },
  accessories: [{
    type: String
  }],
  inventory: [{
    serialNumber: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'excellent'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    location: {
      type: String,
      default: 'Main Warehouse'
    },
    notes: String,
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  pricingRules: [{
    name: {
      type: String,
      required: true
    },
    pricingType: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      required: true
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    minQuantity: {
      type: Number,
      default: 1,
      min: 1
    },
    maxQuantity: Number,
    customerType: {
      type: String,
      enum: ['regular', 'premium', 'corporate']
    },
    validFrom: Date,
    validTo: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ sku: 1 });

// Virtual for available inventory count
productSchema.virtual('availableCount').get(function() {
  return this.inventory.filter(item => item.isAvailable).length;
});

// Virtual for total inventory count
productSchema.virtual('totalCount').get(function() {
  return this.inventory.length;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
