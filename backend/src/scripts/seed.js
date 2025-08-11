const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "../../.env" });
const {
  query,
  transaction,
  connectDB,
  closeDB,
} = require("../config/database");
const logger = require("../utils/logger");

/**
 * Seed initial data
 */
const seedData = async () => {
  try {
    logger.info("Starting database seeding...");

    await connectDB();

    await transaction(async (client) => {
      // Create admin user
      const adminPassword = await bcrypt.hash("admin123", 12);
      const adminId = uuidv4();

      await client.query(
        `
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `,
        [
          adminId,
          "admin@rental.com",
          adminPassword,
          "Admin",
          "User",
          "admin",
          true,
          true,
        ]
      );

      // Create staff user
      const staffPassword = await bcrypt.hash("staff123", 12);
      const staffId = uuidv4();

      await client.query(
        `
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `,
        [
          staffId,
          "staff@rental.com",
          staffPassword,
          "Staff",
          "User",
          "staff",
          true,
          true,
        ]
      );

      // Create demo customer
      const customerPassword = await bcrypt.hash("customer123", 12);
      const customerId = uuidv4();

      await client.query(
        `
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `,
        [
          customerId,
          "customer@rental.com",
          customerPassword,
          "Demo",
          "Customer",
          "customer",
          true,
          true,
        ]
      );

      // Create categories
      const categories = [
        {
          id: uuidv4(),
          name: "Electronics",
          description: "Electronic devices and gadgets",
        },
        {
          id: uuidv4(),
          name: "Photography",
          description: "Cameras and photography equipment",
        },
        {
          id: uuidv4(),
          name: "Audio/Video",
          description: "Audio and video equipment",
        },
        {
          id: uuidv4(),
          name: "Tools",
          description: "Power tools and equipment",
        },
        {
          id: uuidv4(),
          name: "Sports",
          description: "Sports and outdoor equipment",
        },
        {
          id: uuidv4(),
          name: "Party Supplies",
          description: "Party and event equipment",
        },
      ];

      for (const category of categories) {
        await client.query(
          `
          INSERT INTO categories (id, name, description, is_active)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `,
          [category.id, category.name, category.description, true]
        );
      }

      // Create sample products
      const products = [
        {
          id: uuidv4(),
          name: "Canon EOS R5 Camera",
          description: "Professional mirrorless camera with 45MP sensor",
          category_id: categories[1].id,
          sku: "CAM-R5-001",
          brand: "Canon",
          model: "EOS R5",
          condition: "excellent",
          replacement_value: 3899.0,
          requires_deposit: true,
          deposit_amount: 500.0,
          min_rental_period: 24,
          max_rental_period: 720,
          advance_booking_days: 7,
          late_fee_per_day: 50.0,
          images: JSON.stringify(["camera1.jpg", "camera2.jpg"]),
          specifications: JSON.stringify({
            resolution: "45MP",
            video: "8K RAW",
            iso: "100-51200",
            weight: "650g",
          }),
        },
        {
          id: uuidv4(),
          name: 'MacBook Pro 16" M2',
          description: "High-performance laptop for creative professionals",
          category_id: categories[0].id,
          sku: "LAP-MBP-001",
          brand: "Apple",
          model: 'MacBook Pro 16"',
          condition: "excellent",
          replacement_value: 2499.0,
          requires_deposit: true,
          deposit_amount: 400.0,
          min_rental_period: 24,
          max_rental_period: 2160,
          advance_booking_days: 3,
          late_fee_per_day: 30.0,
          images: JSON.stringify(["laptop1.jpg", "laptop2.jpg"]),
          specifications: JSON.stringify({
            processor: "M2 Pro",
            memory: "16GB",
            storage: "512GB SSD",
            display: '16.2" Liquid Retina XDR',
          }),
        },
        {
          id: uuidv4(),
          name: "Professional Sound System",
          description: "Complete PA system for events and parties",
          category_id: categories[2].id,
          sku: "AUD-PA-001",
          brand: "JBL",
          model: "PRX815W",
          condition: "good",
          replacement_value: 1299.0,
          requires_deposit: true,
          deposit_amount: 200.0,
          min_rental_period: 4,
          max_rental_period: 168,
          advance_booking_days: 2,
          late_fee_per_day: 25.0,
          images: JSON.stringify(["speaker1.jpg", "speaker2.jpg"]),
          specifications: JSON.stringify({
            power: "1500W",
            frequency: "39Hz - 20kHz",
            connectivity: "WiFi, Bluetooth",
            weight: "18.6kg",
          }),
        },
        {
          id: uuidv4(),
          name: "Professional Drill Set",
          description: "Complete cordless drill set with accessories",
          category_id: categories[3].id,
          sku: "TOL-DRL-001",
          brand: "DeWalt",
          model: "DCD771C2",
          condition: "good",
          replacement_value: 199.0,
          requires_deposit: false,
          deposit_amount: 0.0,
          min_rental_period: 4,
          max_rental_period: 168,
          advance_booking_days: 1,
          late_fee_per_day: 10.0,
          images: JSON.stringify(["drill1.jpg", "drill2.jpg"]),
          specifications: JSON.stringify({
            voltage: "20V MAX",
            torque: "300 UWO",
            speed: "0-450/1500 RPM",
            chuck: "1/2 inch",
          }),
        },
      ];

      for (const product of products) {
        await client.query(
          `
          INSERT INTO products (
            id, name, description, category_id, sku, brand, model, condition,
            replacement_value, requires_deposit, deposit_amount, min_rental_period,
            max_rental_period, advance_booking_days, late_fee_per_day, images, specifications
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (sku) DO NOTHING
        `,
          [
            product.id,
            product.name,
            product.description,
            product.category_id,
            product.sku,
            product.brand,
            product.model,
            product.condition,
            product.replacement_value,
            product.requires_deposit,
            product.deposit_amount,
            product.min_rental_period,
            product.max_rental_period,
            product.advance_booking_days,
            product.late_fee_per_day,
            product.images,
            product.specifications,
          ]
        );

        // Create inventory items for each product
        for (let i = 1; i <= 3; i++) {
          await client.query(
            `
            INSERT INTO product_inventory (
              id, product_id, serial_number, condition, is_available, location
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
          `,
            [
              uuidv4(),
              product.id,
              `${product.sku}-${i.toString().padStart(3, "0")}`,
              product.condition,
              true,
              "Main Warehouse",
            ]
          );
        }
      }

      // Create pricing rules
      const pricingRules = [
        // Camera pricing
        { product_id: products[0].id, pricing_type: "daily", base_price: 89.0 },
        {
          product_id: products[0].id,
          pricing_type: "weekly",
          base_price: 499.0,
        },
        {
          product_id: products[0].id,
          pricing_type: "monthly",
          base_price: 1799.0,
        },

        // Laptop pricing
        { product_id: products[1].id, pricing_type: "daily", base_price: 59.0 },
        {
          product_id: products[1].id,
          pricing_type: "weekly",
          base_price: 349.0,
        },
        {
          product_id: products[1].id,
          pricing_type: "monthly",
          base_price: 1299.0,
        },

        // Sound system pricing
        {
          product_id: products[2].id,
          pricing_type: "hourly",
          base_price: 25.0,
        },
        {
          product_id: products[2].id,
          pricing_type: "daily",
          base_price: 149.0,
        },
        {
          product_id: products[2].id,
          pricing_type: "weekly",
          base_price: 899.0,
        },

        // Drill pricing
        { product_id: products[3].id, pricing_type: "hourly", base_price: 8.0 },
        { product_id: products[3].id, pricing_type: "daily", base_price: 29.0 },
        {
          product_id: products[3].id,
          pricing_type: "weekly",
          base_price: 149.0,
        },
      ];

      for (const rule of pricingRules) {
        await client.query(
          `
          INSERT INTO pricing_rules (
            id, product_id, name, pricing_type, base_price, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `,
          [
            uuidv4(),
            rule.product_id,
            `${rule.pricing_type} rate`,
            rule.pricing_type,
            rule.base_price,
            true,
          ]
        );
      }

      logger.info("Database seeding completed successfully");
    });
  } catch (error) {
    logger.error("Seeding failed:", error.message);
    throw error;
  } finally {
    await closeDB();
  }
};

// Run if called directly
if (require.main === module) {
  seedData().catch((error) => {
    logger.error("Seed script failed:", error.message);
    process.exit(1);
  });
}

module.exports = {
  seedData,
};
