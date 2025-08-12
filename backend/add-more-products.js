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
    console.log("Starting to add more products...");

    // Get existing categories
    const categories = await Category.find({});
    console.log(
      "Found categories:",
      categories.map((c) => c.name)
    );

    // Find category IDs
    const electronicsCategory = categories.find(
      (c) => c.name === "Electronics"
    )?._id;
    const photographyCategory = categories.find(
      (c) => c.name === "Photography"
    )?._id;
    const audioVideoCategory = categories.find(
      (c) => c.name === "Audio/Video"
    )?._id;
    const toolsCategory = categories.find((c) => c.name === "Tools")?._id;
    const medicalCategory = categories.find(
      (c) => c.name === "Medical Equipment"
    )?._id;
    const furnitureCategory = categories.find(
      (c) => c.name === "Furniture"
    )?._id;

    // Create additional categories if needed
    const additionalCategories = [
      {
        name: "Sports & Recreation",
        description: "Sports and recreational equipment",
      },
      { name: "Party & Events", description: "Party and event supplies" },
      { name: "Automotive", description: "Automotive tools and equipment" },
      {
        name: "Home & Garden",
        description: "Home improvement and gardening tools",
      },
    ];

    const newCategories = {};
    for (const catData of additionalCategories) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = new Category(catData);
        await category.save();
        console.log(`Created new category: ${catData.name}`);
      }
      newCategories[catData.name] = category._id;
    }

    // Comprehensive product list
    const newProducts = [
      // Electronics
      {
        name: 'iPad Pro 12.9"',
        description:
          "Latest iPad Pro with M2 chip, perfect for digital art and presentations",
        category: electronicsCategory,
        sku: "TAB-IPAD-001",
        brand: "Apple",
        model: 'iPad Pro 12.9" (6th gen)',
        condition: "excellent",
        replacementValue: 1099.0,
        requiresDeposit: true,
        depositAmount: 200.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          screen_size: "12.9 inches",
          processor: "M2 chip",
          storage: "128GB",
          connectivity: "Wi-Fi + Cellular",
        },
        accessories: ["Apple Pencil", "Magic Keyboard", "USB-C Cable"],
        inventory: [
          {
            serialNumber: "TAB-IPAD-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "TAB-IPAD-001-002",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 45,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 250,
            isActive: true,
          },
        ],
      },
      {
        name: "Gaming Laptop - ASUS ROG",
        description: "High-performance gaming laptop with RTX 4070 graphics",
        category: electronicsCategory,
        sku: "LAP-ASUS-001",
        brand: "ASUS",
        model: "ROG Strix G16",
        condition: "excellent",
        replacementValue: 1899.0,
        requiresDeposit: true,
        depositAmount: 300.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 1440,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          processor: "Intel Core i7-13650HX",
          graphics: "NVIDIA RTX 4070",
          memory: "16GB DDR5",
          storage: "1TB SSD",
          display: '16" 165Hz',
        },
        accessories: ["Gaming Mouse", "Power Adapter", "Carrying Case"],
        inventory: [
          {
            serialNumber: "LAP-ASUS-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "LAP-ASUS-001-002",
            condition: "good",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 75,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 450,
            isActive: true,
          },
        ],
      },
      // Photography Equipment
      {
        name: "Sony A7 IV Camera",
        description:
          "Full-frame mirrorless camera with 33MP sensor and 4K video",
        category: photographyCategory,
        sku: "CAM-SONY-001",
        brand: "Sony",
        model: "Alpha A7 IV",
        condition: "excellent",
        replacementValue: 2498.0,
        requiresDeposit: true,
        depositAmount: 400.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          sensor: "33MP Full-Frame",
          video: "4K 60p",
          iso: "100-51200",
          stabilization: "5-axis IBIS",
        },
        accessories: [
          "24-70mm Lens",
          "Extra Battery",
          "Memory Card",
          "Camera Bag",
        ],
        inventory: [
          {
            serialNumber: "CAM-SONY-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "CAM-SONY-001-002",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 95,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 550,
            isActive: true,
          },
        ],
      },
      {
        name: "Professional Tripod",
        description:
          "Carbon fiber tripod for professional photography and videography",
        category: photographyCategory,
        sku: "TRI-MANF-001",
        brand: "Manfrotto",
        model: "MT055CXPRO4",
        condition: "excellent",
        replacementValue: 449.0,
        requiresDeposit: false,
        depositAmount: 0.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          material: "Carbon Fiber",
          max_height: "170cm",
          min_height: "9cm",
          weight: "1.8kg",
          load_capacity: "9kg",
        },
        accessories: ["Ball Head", "Carrying Case"],
        inventory: [
          {
            serialNumber: "TRI-MANF-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "TRI-MANF-001-002",
            condition: "good",
            isAvailable: true,
          },
          {
            serialNumber: "TRI-MANF-001-003",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 15,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 75,
            isActive: true,
          },
        ],
      },
      // Audio/Video Equipment
      {
        name: "Professional Microphone",
        description:
          "Studio-quality condenser microphone for recording and streaming",
        category: audioVideoCategory,
        sku: "MIC-RODE-001",
        brand: "Rode",
        model: "PodMic",
        condition: "excellent",
        replacementValue: 199.0,
        requiresDeposit: false,
        depositAmount: 0.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          type: "Dynamic Microphone",
          frequency_response: "20Hz-20kHz",
          connectivity: "XLR",
          polar_pattern: "Cardioid",
        },
        accessories: ["XLR Cable", "Microphone Stand", "Pop Filter"],
        inventory: [
          {
            serialNumber: "MIC-RODE-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "MIC-RODE-001-002",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 25,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 120,
            isActive: true,
          },
        ],
      },
      {
        name: "Portable PA System",
        description:
          "Wireless portable PA system perfect for events and presentations",
        category: audioVideoCategory,
        sku: "PA-JBL-001",
        brand: "JBL",
        model: "EON ONE Compact",
        condition: "excellent",
        replacementValue: 599.0,
        requiresDeposit: true,
        depositAmount: 100.0,
        minRentalPeriod: 4,
        maxRentalPeriod: 168,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          power: "112W",
          battery_life: "12 hours",
          connectivity: "Bluetooth, USB, XLR",
          weight: "8.9kg",
        },
        accessories: ["Wireless Microphone", "Power Cable", "Carrying Case"],
        inventory: [
          {
            serialNumber: "PA-JBL-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "PA-JBL-001-002",
            condition: "good",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "hourly rate",
            pricingType: "hourly",
            basePrice: 35,
            isActive: true,
          },
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 85,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 450,
            isActive: true,
          },
        ],
      },
      // Tools
      {
        name: "Cordless Drill Set",
        description: "Professional 18V cordless drill with complete bit set",
        category: toolsCategory,
        sku: "DRL-DEW-001",
        brand: "DeWalt",
        model: "DCD771C2",
        condition: "excellent",
        replacementValue: 149.0,
        requiresDeposit: true,
        depositAmount: 50.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          voltage: "18V",
          battery: "2x 1.3Ah Li-Ion",
          chuck_size: "13mm",
          torque: "42Nm",
        },
        accessories: [
          "Drill Bits Set",
          "Screwdriver Bits",
          "Carrying Case",
          "Charger",
        ],
        inventory: [
          {
            serialNumber: "DRL-DEW-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "DRL-DEW-001-002",
            condition: "good",
            isAvailable: true,
          },
          {
            serialNumber: "DRL-DEW-001-003",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 18,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 85,
            isActive: true,
          },
        ],
      },
      {
        name: "Circular Saw",
        description: "Professional circular saw for wood cutting projects",
        category: toolsCategory,
        sku: "SAW-MAK-001",
        brand: "Makita",
        model: "HS7601",
        condition: "excellent",
        replacementValue: 189.0,
        requiresDeposit: true,
        depositAmount: 75.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          blade_size: "190mm",
          power: "1200W",
          cutting_depth: "66mm",
          weight: "4.1kg",
        },
        accessories: ["Saw Blade", "Rip Fence", "Dust Bag"],
        inventory: [
          {
            serialNumber: "SAW-MAK-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "SAW-MAK-001-002",
            condition: "good",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 22,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 110,
            isActive: true,
          },
        ],
      },
      // Medical Equipment
      {
        name: "Blood Pressure Monitor",
        description: "Digital blood pressure monitor for home healthcare",
        category: medicalCategory,
        sku: "BP-OMR-001",
        brand: "Omron",
        model: "HEM-7120",
        condition: "excellent",
        replacementValue: 89.0,
        requiresDeposit: true,
        depositAmount: 30.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          measurement_range: "0-299 mmHg",
          accuracy: "±3 mmHg",
          memory: "30 readings",
          power: "4x AA batteries",
        },
        accessories: ["Carrying Case", "Instruction Manual", "Batteries"],
        inventory: [
          {
            serialNumber: "BP-OMR-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "BP-OMR-001-002",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 12,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 65,
            isActive: true,
          },
        ],
      },
      {
        name: "Hospital Bed",
        description: "Adjustable hospital bed for home care and recovery",
        category: medicalCategory,
        sku: "BED-MED-001",
        brand: "Invacare",
        model: "Full Electric",
        condition: "excellent",
        replacementValue: 1299.0,
        requiresDeposit: true,
        depositAmount: 200.0,
        minRentalPeriod: 168,
        maxRentalPeriod: 4320,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          weight_capacity: "200kg",
          mattress_size: "90cm x 200cm",
          height_adjustment: "35-75cm",
          power: "Electric",
        },
        accessories: ["Mattress", "Side Rails", "Remote Control", "IV Pole"],
        inventory: [
          {
            serialNumber: "BED-MED-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "BED-MED-001-002",
            condition: "good",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 185,
            isActive: true,
          },
          {
            name: "monthly rate",
            pricingType: "monthly",
            basePrice: 650,
            isActive: true,
          },
        ],
      },
      // Furniture
      {
        name: "Executive Office Chair",
        description: "Ergonomic executive chair with lumbar support",
        category: furnitureCategory,
        sku: "CHR-ERG-001",
        brand: "Herman Miller",
        model: "Aeron",
        condition: "excellent",
        replacementValue: 1395.0,
        requiresDeposit: true,
        depositAmount: 150.0,
        minRentalPeriod: 168,
        maxRentalPeriod: 4320,
        images: ["/chair1.jpg", "/chair2.jpg"],
        specifications: {
          material: "Mesh and Aluminum",
          weight_capacity: "136kg",
          adjustable_height: "38-51cm",
          warranty: "12 years",
        },
        accessories: ["Assembly Instructions", "Warranty Card"],
        inventory: [
          {
            serialNumber: "CHR-ERG-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "CHR-ERG-001-002",
            condition: "good",
            isAvailable: true,
          },
          {
            serialNumber: "CHR-ERG-001-003",
            condition: "excellent",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 95,
            isActive: true,
          },
          {
            name: "monthly rate",
            pricingType: "monthly",
            basePrice: 320,
            isActive: true,
          },
        ],
      },
      {
        name: "Conference Table",
        description: "Large conference table for meetings and events",
        category: furnitureCategory,
        sku: "TBL-CONF-001",
        brand: "Steelcase",
        model: "Universal",
        condition: "excellent",
        replacementValue: 899.0,
        requiresDeposit: true,
        depositAmount: 100.0,
        minRentalPeriod: 24,
        maxRentalPeriod: 720,
        images: ["/chair2.jpg", "/chair1.jpg"],
        specifications: {
          dimensions: "240cm x 120cm x 75cm",
          material: "Laminate top with steel base",
          seating_capacity: "8-10 people",
          weight: "45kg",
        },
        accessories: ["Cable Management", "Leveling Feet"],
        inventory: [
          {
            serialNumber: "TBL-CONF-001-001",
            condition: "excellent",
            isAvailable: true,
          },
          {
            serialNumber: "TBL-CONF-001-002",
            condition: "good",
            isAvailable: true,
          },
        ],
        pricingRules: [
          {
            name: "daily rate",
            pricingType: "daily",
            basePrice: 45,
            isActive: true,
          },
          {
            name: "weekly rate",
            pricingType: "weekly",
            basePrice: 250,
            isActive: true,
          },
        ],
      },
    ];

    // Insert the first batch of products
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
        console.error(
          `❌ Error adding product ${productData.name}:`,
          error.message
        );
      }
    }

    console.log("First batch of products added successfully!");
    console.log("Run this script again to add more products...");
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
