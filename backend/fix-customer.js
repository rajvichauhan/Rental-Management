const mongoose = require('mongoose');
const User = require('./src/models/User');

const fixCustomer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-management');
    console.log('Connected to MongoDB');

    // Delete existing customer
    const deleteResult = await User.deleteMany({ email: 'customer@renteasy.com' });
    console.log('Deleted customer accounts:', deleteResult.deletedCount);

    // Create fresh customer account
    const customerUser = new User({
      email: 'customer@renteasy.com',
      password: 'customer123',
      firstName: 'Jane',
      lastName: 'Customer',
      phone: '+1234567890',
      role: 'customer',
      isActive: true,
      emailVerified: true
    });

    await customerUser.save();
    console.log('✅ Fresh customer account created');

    // Verify the account
    const customer = await User.findOne({ email: 'customer@renteasy.com' }).select('+password');
    console.log('Customer verification:', {
      email: customer.email,
      role: customer.role,
      active: customer.isActive,
      verified: customer.emailVerified,
      hasPassword: !!customer.password,
      passwordLength: customer.password.length
    });

    // Test password comparison
    const isValidPassword = await customer.comparePassword('customer123');
    console.log('Password test result:', isValidPassword);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing customer:', error);
    process.exit(1);
  }
};

fixCustomer();
