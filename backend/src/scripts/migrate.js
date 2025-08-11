const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "../../.env" });
const { query, connectDB, closeDB } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Run database migrations
 */
const runMigrations = async () => {
  try {
    logger.info("Starting database migration...");

    // Connect to database
    await connectDB();

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Split SQL commands by semicolon and execute each one
    const commands = schemaSQL
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    logger.info(`Executing ${commands.length} SQL commands...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      try {
        await query(command);
        logger.debug(`Executed command ${i + 1}/${commands.length}`);
      } catch (error) {
        // Skip errors for commands that might already exist (like CREATE EXTENSION)
        if (error.message.includes("already exists")) {
          logger.debug(`Skipped existing: ${error.message}`);
          continue;
        }
        throw error;
      }
    }

    logger.info("Database migration completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error.message);
    throw error;
  } finally {
    await closeDB();
  }
};

/**
 * Check if tables exist
 */
const checkTables = async () => {
  try {
    await connectDB();

    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = result.rows.map((row) => row.table_name);

    logger.info("Existing tables:", tables);

    const expectedTables = [
      "users",
      "user_addresses",
      "categories",
      "products",
      "product_inventory",
      "pricing_rules",
      "quotations",
      "orders",
      "order_items",
      "payments",
      "notifications",
      "audit_logs",
    ];

    const missingTables = expectedTables.filter(
      (table) => !tables.includes(table)
    );

    if (missingTables.length > 0) {
      logger.warn("Missing tables:", missingTables);
      return false;
    }

    logger.info("All expected tables exist");
    return true;
  } catch (error) {
    logger.error("Error checking tables:", error.message);
    return false;
  } finally {
    await closeDB();
  }
};

/**
 * Drop all tables (use with caution!)
 */
const dropTables = async () => {
  try {
    logger.warn("Dropping all tables...");

    await connectDB();

    // Get all table names
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const tables = result.rows.map((row) => row.table_name);

    // Drop tables in reverse order to handle dependencies
    for (const table of tables.reverse()) {
      await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      logger.debug(`Dropped table: ${table}`);
    }

    // Drop custom types
    const types = [
      "user_role",
      "order_status",
      "payment_status",
      "payment_method",
      "pricing_type",
      "notification_type",
      "notification_status",
    ];

    for (const type of types) {
      await query(`DROP TYPE IF EXISTS ${type} CASCADE`);
      logger.debug(`Dropped type: ${type}`);
    }

    logger.info("All tables and types dropped successfully");
  } catch (error) {
    logger.error("Error dropping tables:", error.message);
    throw error;
  } finally {
    await closeDB();
  }
};

// Command line interface
const command = process.argv[2];

const main = async () => {
  try {
    switch (command) {
      case "up":
        await runMigrations();
        break;
      case "check":
        await checkTables();
        break;
      case "down":
        await dropTables();
        break;
      case "reset":
        await dropTables();
        await runMigrations();
        break;
      default:
        await runMigrations();
        break;
    }
  } catch (error) {
    logger.error("Migration script failed:", error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runMigrations,
  checkTables,
  dropTables,
};
