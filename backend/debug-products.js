const mongoose = require("mongoose");

// Import models
const Product = require("./src/models/Product");
const Category = require("./src/models/Category");

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

const debugProducts = async () => {
  try {
    console.log("Debugging products...");

    // Check all products
    const allProducts = await Product.find().populate("category");
    console.log(`Total products in DB: ${allProducts.length}`);

    allProducts.forEach((product) => {
      console.log(`- ${product.name} (${product.sku})`);
      console.log(`  isActive: ${product.isActive}`);
      console.log(`  category: ${product.category?.name || "None"}`);
      console.log(`  inventory count: ${product.inventory?.length || 0}`);
      console.log("");
    });

    // Check active products
    const activeProducts = await Product.find({ isActive: true }).populate(
      "category"
    );
    console.log(`Active products: ${activeProducts.length}`);

    // Test the exact query from the API
    const filter = { isActive: true };
    const apiProducts = await Product.find(filter)
      .populate("category", "name description")
      .sort({ name: 1 })
      .lean();

    console.log(`API query result: ${apiProducts.length} products`);
  } catch (error) {
    console.error("Error debugging products:", error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await debugProducts();
};

run();
