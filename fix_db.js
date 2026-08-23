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
    
    // Add column if bookings exists
    if (rows.some(r => Object.values(r)[0].toLowerCase() === 'bookings')) {
      await pool.query("ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL");
      console.log("Added coupon_code to bookings");
    } else {
      console.log("bookings table not found in this DB!");
    }
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("coupon_code already exists");
    } else {
      console.error(err);
    }
  }
  
  await pool.end();
}
run();
