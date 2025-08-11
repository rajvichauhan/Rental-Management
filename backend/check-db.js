const mongoose = require('mongoose');

// Import models
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/rental_management', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkData = async () => {
  try {
    console.log('Checking database contents...');

    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Products: ${productCount}`);

    if (productCount > 0) {
      console.log('\nProducts:');
      const products = await Product.find().populate('category');
      products.forEach(product => {
        console.log(`- ${product.name} (${product.sku}) - Category: ${product.category?.name || 'None'}`);
      });
    }

    if (categoryCount > 0) {
      console.log('\nCategories:');
      const categories = await Category.find();
      categories.forEach(category => {
        console.log(`- ${category.name}: ${category.description}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await checkData();
};

run();
