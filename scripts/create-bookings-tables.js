const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      mobile VARCHAR(15) NOT NULL,
      email VARCHAR(255),
      address TEXT NOT NULL,
      payment_method VARCHAR(20) DEFAULT 'cash',
      total_amount DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS booking_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      service_id INT,
      service_title VARCHAR(255),
      quantity INT DEFAULT 1,
      unit_price DECIMAL(10,2) DEFAULT 0,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

  const [cols] = await conn.query('DESCRIBE bookings');
  console.log('bookings columns:', cols.map(c => c.Field).join(', '));
  console.log('Tables created successfully!');
  await conn.end();
}

setup().catch(console.error);
