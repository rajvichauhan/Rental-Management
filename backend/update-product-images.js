require("dotenv").config({ path: "../.env" });
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

const updateProductImages = async () => {
  try {
    console.log("Starting to update product images...");

    // Define image mappings based on product names/SKUs
    const imageUpdates = [
      // Electronics
      {
        sku: "TAB-IPAD-001",
        images: ["/ipad1.jpg", "/ipad2.jpg"],
      },

      // Photography Equipment
      {
        sku: "CAM-SONY-001",
        images: ["/sonycam1.jpg", "/sonycam2.jpg"],
      },
      {
        sku: "TRI-MANF-001",
        images: ["/tripod1.jpg", "/tripod2.jpg"],
      },

      // Audio/Video Equipment
      {
        sku: "MIC-RODE-001",
        images: ["/mic1.jpg", "/mic2.jpg"],
      },

      // Tools
      {
        sku: "DRL-DEW-001",
        images: ["/drill1.jpg", "/drill2.jpg"],
      },
      {
        sku: "SAW-MAK-001",
        images: ["/saw1.jpg", "/saw2.jpg"],
      },

      // Medical Equipment
      {
        sku: "BP-OMR-001",
        images: ["/bpm1.jpg", "/bpm2.jpg"],
      },
      {
        sku: "WHL-001", // Existing wheelchair from seed
        images: ["/wheelchair1.jpg", "/wheelchair2.jpg"],
      },

      // Furniture
      {
        sku: "CHR-ERG-001",
        images: ["/chair1.jpg", "/chair2.jpg"],
      },
      {
        sku: "TBL-CONF-001",
        images: ["/conference1.jpg", "/conference2.jpg"],
      },
      {
        sku: "CHR-001", // Existing chair from seed if any
        images: ["/chair1.jpg", "/chair2.jpg"],
      },
    ];

    // Additional fallback images for products without specific images
    const fallbackImages = {
      Electronics: ["/ipad1.jpg", "/ipad2.jpg"],
      Photography: ["/sonycam1.jpg", "/tripod1.jpg"],
      "Audio/Video": ["/mic1.jpg", "/mic2.jpg"],
      Tools: ["/drill1.jpg", "/saw1.jpg"],
      "Medical Equipment": ["/wheelchair1.jpg", "/bpm1.jpg"],
      Furniture: ["/chair1.jpg", "/conference1.jpg"],
      "Sports & Recreation": ["/chair1.jpg", "/chair2.jpg"], // Using available images as placeholders
      "Party & Events": ["/mic1.jpg", "/mic2.jpg"],
      Automotive: ["/drill1.jpg", "/drill2.jpg"],
      "Home & Garden": ["/saw1.jpg", "/saw2.jpg"],
    };

    let updatedCount = 0;

    // Update products with specific image mappings
    for (const update of imageUpdates) {
      try {
        const result = await Product.updateOne(
          { sku: update.sku },
          { $set: { images: update.images } }
        );

        if (result.matchedCount > 0) {
          console.log(`✅ Updated images for product with SKU: ${update.sku}`);
          updatedCount++;
        } else {
          console.log(`⚠️  Product not found with SKU: ${update.sku}`);
        }
      } catch (error) {
        console.error(
          `❌ Error updating product ${update.sku}:`,
          error.message
        );
      }
    }

    // Update remaining products with fallback images based on category
    const productsWithoutImages = await Product.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { images: ["/chair1.jpg", "/chair2.jpg"] }, // Update products still using placeholder images
      ],
    }).populate("category");

    console.log(
      `Found ${productsWithoutImages.length} products that need image updates`
    );

    for (const product of productsWithoutImages) {
      try {
        const categoryName = product.category?.name;
        const fallbackImageSet = fallbackImages[categoryName] || [
          "/chair1.jpg",
          "/chair2.jpg",
        ];

        // Skip if already has the same fallback images
        if (
          JSON.stringify(product.images) === JSON.stringify(fallbackImageSet)
        ) {
          continue;
        }

        await Product.updateOne(
          { _id: product._id },
          { $set: { images: fallbackImageSet } }
        );

        console.log(
          `✅ Updated fallback images for: ${product.name} (${categoryName})`
        );
        updatedCount++;
      } catch (error) {
        console.error(
          `❌ Error updating fallback images for ${product.name}:`,
          error.message
        );
      }
    }

    console.log(
      `\n🎉 Successfully updated images for ${updatedCount} products!`
    );

    // Display summary of all products and their images
    const allProducts = await Product.find({})
      .populate("category")
      .select("name sku images category");
    console.log("\n📋 Current product image summary:");
    console.log("=====================================");

    for (const product of allProducts) {
      console.log(`${product.name} (${product.sku})`);
      console.log(`  Category: ${product.category?.name || "Unknown"}`);
      console.log(`  Images: ${product.images?.join(", ") || "No images"}`);
      console.log("---");
    }
  } catch (error) {
    console.error("Error updating product images:", error);
  }
};

const main = async () => {
  await connectDB();
  await updateProductImages();
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
};

main().catch(console.error);
