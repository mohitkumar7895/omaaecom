const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
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
    const [rows] = await pool.query("SHOW TABLES");
    console.log("Tables:", rows.map(r => Object.values(r)[0]));
    
    // Add columns if bookings exists
    if (rows.some(r => Object.values(r)[0].toLowerCase() === 'bookings')) {
      try {
        await pool.query("ALTER TABLE bookings ADD COLUMN user_email VARCHAR(255) DEFAULT NULL");
        console.log("Added user_email to bookings");
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log("user_email already exists");
        } else {
          throw err;
        }
      }

      try {
        await pool.query("ALTER TABLE bookings ADD COLUMN amc_coupon_code VARCHAR(100) DEFAULT NULL");
        console.log("Added amc_coupon_code to bookings");
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log("amc_coupon_code already exists");
        } else {
          throw err;
        }
      }
    } else {
      console.log("bookings table not found in this DB!");
    }

    // Create coupons table if it doesn't exist
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
    console.log("Ensured coupons table exists");

  } catch (err) {
    console.error("Error:", err.message);
  }
  
  await pool.end();
}
run();
