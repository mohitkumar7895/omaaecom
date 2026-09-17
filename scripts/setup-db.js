// eslint-disable-next-line @typescript-eslint/no-require-imports
const mysql = require('mysql2/promise');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function setupDatabase() {
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
    // 1. Connect without database selected to create it if it doesn't exist
    // MUST pass multipleStatements: true here!
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });
    
    console.log(`Checking if database '${dbName}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' is ready.`);
    
    // 2. Select the database
    await connection.query(`USE \`${dbName}\``);

    console.log("Reading database.sql...");
    const sqlScriptPath = path.join(__dirname, '../database.sql');
    const sql = fs.readFileSync(sqlScriptPath, 'utf8');

    console.log("Executing SQL queries to build tables...");
    await connection.query(sql);

    console.log("✅ All tables created successfully! The database is fully set up.");
    
    await connection.end();
  } catch (error) {
    console.error("❌ Database setup failed:");
    console.error(error.message);
  }
}

setupDatabase();
