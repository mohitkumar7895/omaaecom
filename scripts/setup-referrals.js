const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function setupReferrals() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306');

  if (!host || !user || !dbName) {
    console.error("❌ ERROR: DB_HOST, DB_USER, or DB_NAME is missing in your .env file.");
    process.exit(1);
  }

  console.log("Connecting to MySQL server...");
  
  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName,
      port,
      multipleStatements: true
    });
    
    console.log("Creating referral_registrations table...");

    const query = `
      CREATE TABLE IF NOT EXISTS referral_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referral_member_id VARCHAR(100) NOT NULL,
        referral_user_name VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        coupon_code VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await connection.query(query);
    console.log("✅ Table referral_registrations created successfully!");
    
    await connection.end();
  } catch (error) {
    console.error("❌ Setup failed:");
    console.error(error.message);
  }
}

setupReferrals();
