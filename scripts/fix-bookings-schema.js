const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log("🔧 Starting bookings schema migration...\n");

    // Add user_email column if it doesn't exist
    try {
      console.log("Adding user_email column to bookings table...");
      await pool.query("ALTER TABLE bookings ADD COLUMN user_email VARCHAR(255) DEFAULT NULL");
      console.log("✅ Added user_email column\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("ℹ️  user_email column already exists\n");
      } else {
        throw err;
      }
    }

    // Add coupon_code column if it doesn't exist
    try {
      console.log("Adding coupon_code column to bookings table...");
      await pool.query("ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(100) DEFAULT NULL");
      console.log("✅ Added coupon_code column\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("ℹ️  coupon_code column already exists\n");
      } else {
        throw err;
      }
    }

    // Create coupons table
    console.log("Creating coupons table...");
    const createCouponsTable = `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createCouponsTable);
    console.log("✅ Created coupons table\n");

    console.log("✅ Migration completed successfully!");
    console.log("\nDatabase schema is now aligned with the API expectations.");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
