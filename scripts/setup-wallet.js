const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function setupWallet() {
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
    
    console.log("Creating wallet_transactions table...");

    const query = `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type ENUM('Credit', 'Debit') NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wallet_email_created (user_email, created_at DESC)
      );
    `;

    await connection.query(query);
    console.log("✅ Table wallet_transactions created successfully!");
    
    await connection.end();
  } catch (error) {
    console.error("❌ Setup failed:");
    console.error(error.message);
  }
}

setupWallet();
