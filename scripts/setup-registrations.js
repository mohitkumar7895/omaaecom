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
      CREATE TABLE IF NOT EXISTS registration_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        work_company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating registration_records table...");
    await pool.query(createTableQuery);

    console.log("Inserting dummy registration records...");
    const dummyData = [
      ['Santosh Kumar', '9893852800', 'asdas', 'dfd', '1-3', '2026-02-27 22:45:00'],
      ['Santosh Kumar', '9893852800', 'asdfsa', 'sadfs', '5-10', '2026-02-27 22:56:00'],
      ['santosh kumar', '8332123456', 'dfsdf', 'sdf', '5-10', '2026-02-27 23:31:00'],
      ['Monu Kumar tamar', '9999251966', 'Ro repair', 'Noida sector', '10+', '2026-02-28 19:11:00'],
    ];

    const insertQuery = `
      INSERT INTO registration_records (name, mobile, work_company, location, experience, created_at)
      VALUES ?
    `;
    
    await pool.query("TRUNCATE TABLE registration_records"); // Clear out if already exists
    await pool.query(insertQuery, [dummyData]);

    console.log("Registration table setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
