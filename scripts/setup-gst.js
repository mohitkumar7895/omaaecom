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
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS gst_settings (
        id INT PRIMARY KEY,
        gst_rate INT DEFAULT 18,
        online_gst_enabled BOOLEAN DEFAULT false,
        cash_gst_enabled BOOLEAN DEFAULT false,
        gst_number VARCHAR(100) DEFAULT '',
        show_gst_on_invoice BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating gst_settings table...");
    await pool.query(createTableQuery);

    // Insert the default row (id = 1) if it doesn't exist
    await pool.query(`
      INSERT IGNORE INTO gst_settings (id, gst_rate, online_gst_enabled, cash_gst_enabled, gst_number, show_gst_on_invoice)
      VALUES (1, 18, false, false, '', false)
    `);

    console.log("GST settings table setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
