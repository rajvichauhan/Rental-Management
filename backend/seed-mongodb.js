const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminUser = new User({
      email: 'admin@rental.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    await adminUser.save();

    // Create customer user
    const customerUser = new User({
      email: 'customer@rental.com',
      password: 'customer123',
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'customer',
      isActive: true,
      emailVerified: true
    });
    await customerUser.save();

    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Photography', description: 'Cameras and photography equipment' },
      { name: 'Audio/Video', description: 'Audio and video equipment' },
      { name: 'Tools', description: 'Power tools and equipment' },
      { name: 'Medical Equipment', description: 'Medical and healthcare equipment' },
      { name: 'Furniture', description: 'Tables, chairs and furniture' }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
    }

    // Create sample products
    const products = [
      {
        name: 'Wheelchairs',
        description: 'Comfortable and reliable wheelchairs for mobility assistance',
        category: createdCategories[4]._id, // Medical Equipment
        sku: 'WHL-001',
        brand: 'MedCare',
        model: 'Comfort Plus',
        condition: 'excellent',
        replacementValue: 500.00,
        requiresDeposit: true,
        depositAmount: 100.00,
        minRentalPeriod: 24, // 1 day
        maxRentalPeriod: 720, // 30 days
        images: ['wheelchair1.jpg', 'wheelchair2.jpg'],
        specifications: {
          weight_capacity: '120kg',
          seat_width: '18 inches',
          material: 'Steel frame',
          wheels: 'Pneumatic tires'
        },
        inventory: [
          { serialNumber: 'WHL-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'WHL-001-002', condition: 'excellent', isAvailable: true },
          { serialNumber: 'WHL-001-003', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'daily rate', pricingType: 'daily', basePrice: 40, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 250, isActive: true },
          { name: 'monthly rate', pricingType: 'monthly', basePrice: 900, isActive: true }
        ]
      },
      {
        name: 'Tables',
        description: 'Sturdy folding tables perfect for events and gatherings',
        category: createdCategories[5]._id, // Furniture
        sku: 'TBL-001',
        brand: 'EventPro',
        model: 'Folding Table 6ft',
        condition: 'good',
        replacementValue: 150.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        minRentalPeriod: 4, // 4 hours
        maxRentalPeriod: 168, // 7 days
        images: ['table1.jpg', 'table2.jpg'],
        specifications: {
          dimensions: '6ft x 2.5ft',
          material: 'Heavy-duty plastic',
          weight: '15kg',
          capacity: '8 people'
        },
        inventory: [
          { serialNumber: 'TBL-001-001', condition: 'good', isAvailable: true },
          { serialNumber: 'TBL-001-002', condition: 'good', isAvailable: true },
          { serialNumber: 'TBL-001-003', condition: 'excellent', isAvailable: true },
          { serialNumber: 'TBL-001-004', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'hourly rate', pricingType: 'hourly', basePrice: 5, isActive: true },
          { name: 'daily rate', pricingType: 'daily', basePrice: 25, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 120, isActive: true }
        ]
      },
      {
        name: 'Chairs',
        description: 'Comfortable stackable chairs for events and meetings',
        category: createdCategories[5]._id, // Furniture
        sku: 'CHR-001',
        brand: 'EventPro',
        model: 'Stackable Chair',
        condition: 'good',
        replacementValue: 45.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        minRentalPeriod: 4, // 4 hours
        maxRentalPeriod: 168, // 7 days
        images: ['chair1.jpg', 'chair2.jpg'],
        specifications: {
          material: 'Plastic',
          weight: '2.5kg',
          stackable: 'Yes',
          color: 'White'
        },
        inventory: [
          { serialNumber: 'CHR-001-001', condition: 'good', isAvailable: true },
          { serialNumber: 'CHR-001-002', condition: 'good', isAvailable: true },
          { serialNumber: 'CHR-001-003', condition: 'excellent', isAvailable: true },
          { serialNumber: 'CHR-001-004', condition: 'good', isAvailable: true },
          { serialNumber: 'CHR-001-005', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'hourly rate', pricingType: 'hourly', basePrice: 2, isActive: true },
          { name: 'daily rate', pricingType: 'daily', basePrice: 8, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 35, isActive: true }
        ]
      }
    ];

    // Insert products
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }

    console.log('Sample products added successfully!');
    console.log(`Added ${createdCategories.length} categories and ${products.length} products`);
    
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await seedData();
};

run();
