const mysql = require('mysql2/promise');

async function setup() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'ommaecom'
  });

  try {
    console.log("Creating rate_headings table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_headings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Emptying rate_headings table...");
    await pool.query('TRUNCATE TABLE rate_headings');

    const dummyData = [
      "Electrical Parts",
      "Gas Charging",
      "Fan Motors",
      "Service & Installation",
      "Minor Repairs",
      "Other Parts",
      "Semi Automatic WM - Power Unit",
      "Semi Automatic WM - Wash Issue",
      "Semi Automatic WM - Spin Issue",
      "Semi Automatic WM - Accessories",
      "Top Load WM - Power Unit",
      "Top Load WM - Wash Issue",
      "Top Load WM - Spin Issue",
      "Top Load WM - Water Leakage",
      "Top Load WM - Accessories"
    ];

    console.log("Inserting dummy rate headings...");
    
    for (const title of dummyData) {
      await pool.query('INSERT INTO rate_headings (title) VALUES (?)', [title]);
    }

    console.log("Rate Headings setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up rate headings:", error);
    process.exit(1);
  }
}

setup();
