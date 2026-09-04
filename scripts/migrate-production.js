/**
 * Production Database Migration
 * Run this ONCE on your Vercel MySQL database to add missing columns and tables
 * 
 * Usage:
 * 1. Update .env with your production database credentials
 * 2. Run: node scripts/migrate-production.js
 * 
 * For Vercel MySQL:
 * - Get credentials from Vercel Dashboard > Storage > MySQL
 * - Set: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in .env
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mysql = require('mysql2/promise');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function runMigration() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306');

  if (!host || !user || !dbName) {
    console.error("❌ ERROR: DB_HOST, DB_USER, or DB_NAME is missing in your .env file.");
    console.error("For Vercel: Get these from Dashboard > Storage > MySQL > Connection Details");
    process.exit(1);
  }

  console.log(`📡 Connecting to ${host}...`);
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName,
      port,
      multipleStatements: true
    });
    
    console.log("✅ Connected to database\n");

    // Migration 1: Add user_email column to bookings
    try {
      console.log("📝 Migration 1: Adding user_email column to bookings...");
      await connection.query("ALTER TABLE bookings ADD COLUMN user_email VARCHAR(255) DEFAULT NULL");
      console.log("   ✅ user_email column added\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  user_email column already exists\n");
      } else {
        throw err;
      }
    }

    // Migration 2: Add amc_coupon_code column to bookings
    try {
      console.log("📝 Migration 2: Adding amc_coupon_code column to bookings...");
      await connection.query("ALTER TABLE bookings ADD COLUMN amc_coupon_code VARCHAR(100) DEFAULT NULL");
      console.log("   ✅ amc_coupon_code column added\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  amc_coupon_code column already exists\n");
      } else {
        throw err;
      }
    }

    // Migration 3: Create coupons table
    try {
      console.log("📝 Migration 3: Creating coupons table...");
      const createCouponsSQL = `
        CREATE TABLE IF NOT EXISTS coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(100) NOT NULL UNIQUE,
          discount_percentage INT DEFAULT 0,
          discount_amount DECIMAL(10, 2) DEFAULT 0,
          max_uses INT DEFAULT NULL,
          current_uses INT DEFAULT 0,
          status ENUM('Active', 'Inactive') DEFAULT 'Active',
          expiry_date DATE DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_coupon_code (code),
          INDEX idx_coupon_status (status)
        );
      `;
      await connection.query(createCouponsSQL);
      console.log("   ✅ coupons table created\n");
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log("   ℹ️  coupons table already exists\n");
      } else {
        throw err;
      }
    }

    // Migration 4: Add mobile column to users if missing
    try {
      console.log("📝 Migration 4: Adding mobile column to users...");
      await connection.query("ALTER TABLE users ADD COLUMN mobile VARCHAR(20) DEFAULT NULL");
      console.log("   ✅ mobile column added to users\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  mobile column already exists in users\n");
      } else {
        throw err;
      }
    }

    // Verification: Check bookings table structure
    console.log("📊 Verifying bookings table structure...");
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'bookings' AND TABLE_SCHEMA = ?`,
      [dbName]
    );
    
    const requiredColumns = ['user_email', 'amc_coupon_code'];
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    console.log("   Current bookings columns:", existingColumns.join(", "));
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length === 0) {
      console.log("   ✅ All required columns present\n");
    } else {
      console.log("   ⚠️  Missing columns:", missingColumns.join(", "), "\n");
    }

    // Verification: Check coupons table
    console.log("📊 Verifying coupons table...");
    try {
      await connection.query("SELECT COUNT(*) as count FROM coupons LIMIT 1");
      console.log("   ✅ coupons table exists and is accessible\n");
    } catch {
      console.log("   ⚠️  Could not access coupons table\n");
    }

    console.log("✅ =========================================");
    console.log("✅ Migration completed successfully!");
    console.log("✅ Your database is now ready for the API");
    console.log("✅ =========================================\n");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check that DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct in .env");
    console.error("2. For Vercel MySQL: Get credentials from Dashboard > Storage > MySQL");
    console.error("3. Ensure your IP is whitelisted for database access");
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
