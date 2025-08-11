const mongoose = require("mongoose");
const User = require("./src/models/User");

const createTestAccounts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/rental-management"
    );
    console.log("Connected to MongoDB");

    // Clear existing test accounts
    await User.deleteMany({
      email: { $in: ["customer@renteasy.com", "vendor@renteasy.com"] },
    });
    console.log("Cleared existing test accounts");

    // Create customer account
    const customerUser = new User({
      email: "customer@renteasy.com",
      password: "customer123",
      firstName: "Jane",
      lastName: "Customer",
      phone: "+1234567890",
      role: "customer",
      isActive: true,
      emailVerified: true,
    });

    await customerUser.save();
    console.log("✅ Customer account created");

    // Create vendor account
    const vendorUser = new User({
      email: "vendor@renteasy.com",
      password: "vendor123",
      firstName: "John",
      lastName: "Vendor",
      phone: "+919737775360",
      role: "vendor",
      isActive: true,
      emailVerified: true,
    });

    await vendorUser.save();
    console.log("✅ Vendor account created");

    // Verify accounts
    const customer = await User.findOne({ email: "customer@renteasy.com" });
    const vendor = await User.findOne({ email: "vendor@renteasy.com" });

    console.log("\n=== ACCOUNT VERIFICATION ===");
    console.log("Customer:", {
      email: customer.email,
      role: customer.role,
      active: customer.isActive,
      verified: customer.emailVerified,
    });
    console.log("Vendor:", {
      email: vendor.email,
      role: vendor.role,
      active: vendor.isActive,
      verified: vendor.emailVerified,
    });

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Customer Login:");
    console.log("  Email: customer@renteasy.com");
    console.log("  Password: customer123");
    console.log("  Role: customer");
    console.log("");
    console.log("Vendor Login:");
    console.log("  Email: vendor@renteasy.com");
    console.log("  Password: vendor123");
    console.log("  Role: vendor");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error creating test accounts:", error);
    process.exit(1);
  }
};

createTestAccounts();
