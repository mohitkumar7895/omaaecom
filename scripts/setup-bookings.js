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
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL,
        type VARCHAR(50) DEFAULT 'Normal Service',
        customer_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        category VARCHAR(255) NOT NULL,
        services TEXT NOT NULL,
        booking_date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        total INT DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'cashfree',
        payment_status ENUM('Completed', 'Pending') DEFAULT 'Pending',
        working_status ENUM('Complete', 'Reject', 'Pendi') DEFAULT 'Pendi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Creating bookings table...");
    await pool.query(createTableQuery);

    console.log("Inserting dummy bookings...");
    const dummyData = [
      ['OMAA2026032289300', 'Normal Service', 'Santosh Kumar', '9999251966', 'Ac Repair & Services', 'Foam-jet service', '2026-03-01', '17:30 - 20:30', 1040, 'cashfree', 'Completed', 'Reject'],
      ['OMAA202603115479', 'Normal Service', 'Tapan rawat', '9458030205', 'Ac Repair & Services', 'Foam-jet service', '2026-03-12', '09:00 AM - 09:00 PM', 548, 'cashfree', 'Completed', 'Complete'],
      ['OMAA202603127807', 'Normal Service', 'Santosh Kumar', '9893852800', 'Microwave Repair', 'Not heating/check-up', '2026-03-12', '10:00 - 13:00', 248, 'cashfree', 'Completed', 'Complete'],
      ['OMAA202603128179', 'Normal Service', 'Santosh Kumar', '9893852800', 'Ac Repair & Services', 'Foam-jet service', '2026-03-12', '16:00 - 19:00', 1049, 'cashfree', 'Completed', 'Complete'],
      ['OMAA202603126356', 'Normal Service', 'Santosh Kumar', '9893852800', 'Ac Repair & Services', 'Foam-jet service', '2026-03-12', '16:00 - 19:00', 549, 'cashfree', 'Pending', 'Pendi'],
      ['OMAA202603120430', 'Normal Service', 'Santosh Kumar', '9893852800', 'Ac Repair & Services', 'Premium AC Service', '2026-03-12', '13:00 - 16:00', 548, 'cashfree', 'Pending', 'Pendi'],
    ];

    const insertQuery = `
      INSERT INTO bookings (order_id, type, customer_name, mobile, category, services, booking_date, time_slot, total, payment_method, payment_status, working_status)
      VALUES ?
    `;
    
    await pool.query("TRUNCATE TABLE bookings"); // Clear out if already exists
    await pool.query(insertQuery, [dummyData]);

    console.log("Bookings table setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
