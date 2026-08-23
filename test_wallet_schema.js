require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    const [users] = await connection.query('DESCRIBE users');
    const [wallet] = await connection.query('DESCRIBE wallet_transactions');
    console.log("USERS TABLE:", JSON.stringify(users, null, 2));
    console.log("WALLET_TRANSACTIONS TABLE:", JSON.stringify(wallet, null, 2));
    await connection.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

main();
