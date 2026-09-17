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
    console.log("Dropping old banners table...");
    await pool.query("DROP TABLE IF EXISTS banners");

    const createTableQuery = `
      CREATE TABLE banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        banner1_url VARCHAR(255) DEFAULT NULL,
        banner2_url VARCHAR(255) DEFAULT NULL,
        banner3_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating new banners table...");
    await pool.query(createTableQuery);

    console.log("Table updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
