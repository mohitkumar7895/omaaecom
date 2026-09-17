const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function setupReferredBy() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'omaa_db',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log("Adding referred_by column to bookings table if it doesn't exist...");
    
    // Check if column exists
    const [columns] = await connection.query(`SHOW COLUMNS FROM bookings LIKE 'referred_by'`);
    
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(100) DEFAULT NULL`);
      console.log("Success: referred_by column added.");
    } else {
      console.log("The referred_by column already exists in bookings.");
    }
    
  } catch (error) {
    console.error("Error setting up referred_by:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupReferredBy();
