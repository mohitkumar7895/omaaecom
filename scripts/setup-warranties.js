import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ommaecom',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true
});

async function run() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS warranties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        service_id INT DEFAULT NULL,
        order_id VARCHAR(50) NOT NULL,
        issued_date DATE NOT NULL,
        expiry_date DATE DEFAULT NULL,
        days_valid INT NOT NULL,
        status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating warranties table...");
    await pool.query(createTableQuery);
    
    // Insert dummy data
    console.log("Inserting dummy data...");
    const insertQuery = `
      INSERT INTO warranties (customer_name, customer_phone, order_id, issued_date, expiry_date, days_valid, status)
      VALUES 
        ('Santosh kumar', '9893852800', '6673G7', '2026-07-19', NULL, 100, 'EXPIRED'),
        ('Santosh kumar', '9893852800', '6673G7', '2026-07-19', NULL, 90, 'EXPIRED'),
        ('Santosh kumar', '9893852800', 'OMAA202603235634', '2026-03-24', NULL, 100, 'EXPIRED'),
        ('Monu Kumar Tamar', '9993251966', 'OMAA202603218011', '2026-03-22', NULL, 100, 'ACTIVE'),
        ('Monu Kumar Tamar', '9993251966', 'OMAA202603213937', '2026-03-22', NULL, 90, 'ACTIVE')
    `;
    
    // Check if table is empty first
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM warranties");
    if (rows[0].count === 0) {
      await pool.query(insertQuery);
      console.log("Dummy data inserted.");
    } else {
      console.log("Data already exists. Skipping insertion.");
    }

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
