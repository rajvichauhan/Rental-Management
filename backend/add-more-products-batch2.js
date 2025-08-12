require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

// Import models
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/rental_management", {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const addMoreProducts = async () => {
  try {
    console.log("Starting to add batch 2 products...");

    // Get existing categories
    const categories = await Category.find({});
    console.log("Found categories:", categories.map(c => c.name));

    // Find category IDs
    const electronicsCategory = categories.find(c => c.name === 'Electronics')?._id;
    const photographyCategory = categories.find(c => c.name === 'Photography')?._id;
    const audioVideoCategory = categories.find(c => c.name === 'Audio/Video')?._id;
    const toolsCategory = categories.find(c => c.name === 'Tools')?._id;
    const medicalCategory = categories.find(c => c.name === 'Medical Equipment')?._id;
    const furnitureCategory = categories.find(c => c.name === 'Furniture')?._id;
    const sportsCategory = categories.find(c => c.name === 'Sports & Recreation')?._id;
    const partyCategory = categories.find(c => c.name === 'Party & Events')?._id;
    const automotiveCategory = categories.find(c => c.name === 'Automotive')?._id;
    const homeGardenCategory = categories.find(c => c.name === 'Home & Garden')?._id;

    // Second batch of products
    const newProducts = [
      // Sports & Recreation
      {
        name: 'Mountain Bike',
        description: 'High-quality mountain bike for outdoor adventures',
        category: sportsCategory,
        sku: 'BIKE-MTN-001',
        brand: 'Trek',
        model: 'Marlin 7',
        condition: 'excellent',
        replacementValue: 899.00,
        requiresDeposit: true,
        depositAmount: 150.00,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ['/chair1.jpg', '/chair2.jpg'],
        specifications: {
          frame_size: 'Medium (17.5")',
          wheel_size: '29 inches',
          gears: '21-speed',
          weight: '14.5kg',
          suspension: 'Front suspension'
        },
        accessories: ['Helmet', 'Water Bottle', 'Bike Lock', 'Repair Kit'],
        inventory: [
          { serialNumber: 'BIKE-MTN-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'BIKE-MTN-001-002', condition: 'good', isAvailable: true },
          { serialNumber: 'BIKE-MTN-001-003', condition: 'excellent', isAvailable: true }
        ],
        pricingRules: [
          { name: 'daily rate', pricingType: 'daily', basePrice: 35, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 180, isActive: true }
        ]
      },
      {
        name: 'Camping Tent',
        description: '4-person waterproof camping tent for outdoor adventures',
        category: sportsCategory,
        sku: 'TENT-CAM-001',
        brand: 'Coleman',
        model: 'Sundome 4',
        condition: 'excellent',
        replacementValue: 149.00,
        requiresDeposit: true,
        depositAmount: 50.00,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ['/chair2.jpg', '/chair1.jpg'],
        specifications: {
          capacity: '4 persons',
          dimensions: '2.7m x 2.4m x 1.8m',
          weight: '4.8kg',
          material: 'Polyester with waterproof coating'
        },
        accessories: ['Ground Tarp', 'Stakes', 'Guy Lines', 'Carry Bag'],
        inventory: [
          { serialNumber: 'TENT-CAM-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'TENT-CAM-001-002', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'daily rate', pricingType: 'daily', basePrice: 25, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 120, isActive: true }
        ]
      },
      // Party & Events
      {
        name: 'DJ Mixer Console',
        description: 'Professional DJ mixer for parties and events',
        category: partyCategory,
        sku: 'MIX-PIO-001',
        brand: 'Pioneer',
        model: 'DJM-450',
        condition: 'excellent',
        replacementValue: 699.00,
        requiresDeposit: true,
        depositAmount: 150.00,
        minRentalPeriod: 4,
        maxRentalPeriod: 168,
        images: ['/chair1.jpg', '/chair2.jpg'],
        specifications: {
          channels: '2-channel',
          connectivity: 'USB, RCA, XLR',
          effects: 'Built-in sound effects',
          dimensions: '32cm x 10cm x 27cm'
        },
        accessories: ['Power Cable', 'USB Cable', 'RCA Cables', 'Manual'],
        inventory: [
          { serialNumber: 'MIX-PIO-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'MIX-PIO-001-002', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'hourly rate', pricingType: 'hourly', basePrice: 45, isActive: true },
          { name: 'daily rate', pricingType: 'daily', basePrice: 120, isActive: true }
        ]
      },
      {
        name: 'Party Lights Set',
        description: 'LED party lights with multiple colors and effects',
        category: partyCategory,
        sku: 'LGT-LED-001',
        brand: 'Chauvet',
        model: 'SlimPAR Pro',
        condition: 'excellent',
        replacementValue: 299.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        minRentalPeriod: 4,
        maxRentalPeriod: 168,
        images: ['/chair2.jpg', '/chair1.jpg'],
        specifications: {
          led_count: '12x 3W RGB LEDs',
          beam_angle: '25 degrees',
          control: 'DMX-512, Sound-activated',
          power: '36W'
        },
        accessories: ['DMX Cable', 'Power Cable', 'Remote Control', 'Mounting Bracket'],
        inventory: [
          { serialNumber: 'LGT-LED-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'LGT-LED-001-002', condition: 'excellent', isAvailable: true },
          { serialNumber: 'LGT-LED-001-003', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'hourly rate', pricingType: 'hourly', basePrice: 25, isActive: true },
          { name: 'daily rate', pricingType: 'daily', basePrice: 65, isActive: true }
        ]
      },
      // Automotive
      {
        name: 'Car Jack Set',
        description: 'Hydraulic car jack with stands for vehicle maintenance',
        category: automotiveCategory,
        sku: 'JACK-HYD-001',
        brand: 'Craftsman',
        model: '3-Ton Floor Jack',
        condition: 'excellent',
        replacementValue: 189.00,
        requiresDeposit: true,
        depositAmount: 75.00,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ['/chair1.jpg', '/chair2.jpg'],
        specifications: {
          capacity: '3 tons',
          lift_range: '14cm - 56cm',
          weight: '27kg',
          material: 'Steel construction'
        },
        accessories: ['Jack Stands (2)', 'Handle', 'Safety Manual'],
        inventory: [
          { serialNumber: 'JACK-HYD-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'JACK-HYD-001-002', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'daily rate', pricingType: 'daily', basePrice: 28, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 150, isActive: true }
        ]
      },
      // Home & Garden
      {
        name: 'Pressure Washer',
        description: 'Electric pressure washer for cleaning driveways and patios',
        category: homeGardenCategory,
        sku: 'PWR-KAR-001',
        brand: 'Karcher',
        model: 'K5 Premium',
        condition: 'excellent',
        replacementValue: 399.00,
        requiresDeposit: true,
        depositAmount: 100.00,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ['/chair2.jpg', '/chair1.jpg'],
        specifications: {
          pressure: '145 bar',
          flow_rate: '500 L/h',
          power: '2100W',
          hose_length: '8m'
        },
        accessories: ['Vario Power Spray Lance', 'Dirtblaster Spray Lance', 'Detergent Tank'],
        inventory: [
          { serialNumber: 'PWR-KAR-001-001', condition: 'excellent', isAvailable: true },
          { serialNumber: 'PWR-KAR-001-002', condition: 'good', isAvailable: true }
        ],
        pricingRules: [
          { name: 'daily rate', pricingType: 'daily', basePrice: 45, isActive: true },
          { name: 'weekly rate', pricingType: 'weekly', basePrice: 220, isActive: true }
        ]
      }
    ];

    // Insert the second batch of products
    for (const productData of newProducts) {
      try {
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (!existingProduct) {
          const product = new Product(productData);
          await product.save();
          console.log(`✅ Added product: ${productData.name}`);
        } else {
          console.log(`⚠️  Product already exists: ${productData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding product ${productData.name}:`, error.message);
      }
    }

    console.log("Second batch of products added successfully!");

  } catch (error) {
    console.error("Error adding products:", error);
  }
};

const main = async () => {
  await connectDB();
  await addMoreProducts();
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
};

main().catch(console.error);
