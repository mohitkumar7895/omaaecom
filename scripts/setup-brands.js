import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ommaecom',
  port: parseInt(process.env.DB_PORT || '3306'),
});

async function run() {
  try {
    console.log("Dropping old brands table...");
    await pool.query("DROP TABLE IF EXISTS brands");

    const createTableQuery = `
      CREATE TABLE brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255) DEFAULT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating new brands table...");
    await pool.query(createTableQuery);

    console.log("Brands table updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
