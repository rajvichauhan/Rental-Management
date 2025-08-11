const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

const createSampleVendor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-management');
    console.log('Connected to MongoDB');

    // Check if vendor already exists
    const existingVendor = await User.findOne({ email: 'vendor@renteasy.com' });
    if (existingVendor) {
      console.log('Sample vendor already exists!');
      console.log('Email: vendor@renteasy.com');
      console.log('Password: vendor123');
      console.log('Role:', existingVendor.role);
      return;
    }

    // Create sample vendor user
    const vendorUser = new User({
      email: 'vendor@renteasy.com',
      password: 'vendor123', // This will be hashed by the pre-save middleware
      firstName: 'John',
      lastName: 'Vendor',
      phone: '+1234567890',
      role: 'vendor',
      isActive: true,
      emailVerified: true
    });

    await vendorUser.save();
    console.log('✅ Sample vendor created successfully!');
    console.log('');
    console.log('=== VENDOR LOGIN CREDENTIALS ===');
    console.log('Email: vendor@renteasy.com');
    console.log('Password: vendor123');
    console.log('Role: vendor');
    console.log('');
    console.log('You can now login with these credentials to test the vendor dashboard.');

  } catch (error) {
    console.error('Error creating sample vendor:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Also create a sample customer for testing
const createSampleCustomer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-management');

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email: 'customer@renteasy.com' });
    if (existingCustomer) {
      console.log('Sample customer already exists!');
      return;
    }

    // Create sample customer user
    const customerUser = new User({
      email: 'customer@renteasy.com',
      password: 'customer123',
      firstName: 'Jane',
      lastName: 'Customer',
      phone: '+1234567891',
      role: 'customer',
      isActive: true,
      emailVerified: true
    });

    await customerUser.save();
    console.log('✅ Sample customer created successfully!');
    console.log('');
    console.log('=== CUSTOMER LOGIN CREDENTIALS ===');
    console.log('Email: customer@renteasy.com');
    console.log('Password: customer123');
    console.log('Role: customer');

  } catch (error) {
    console.error('Error creating sample customer:', error);
  } finally {
    await mongoose.disconnect();
  }
};

const createSampleUsers = async () => {
  await createSampleVendor();
  await createSampleCustomer();
};

// Run the script
createSampleUsers();
