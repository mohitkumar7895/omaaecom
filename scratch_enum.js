const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ommaecom'
  });
  
  try {
    await c.query("ALTER TABLE bookings MODIFY COLUMN working_status ENUM('Complete', 'Completed', 'Reject', 'Pendi') DEFAULT 'Pendi'");
    console.log('Enum updated');
    
    // Also update all existing 'Complete' to 'Completed' in the table
    await c.query("UPDATE bookings SET working_status = 'Completed' WHERE working_status = 'Complete'");
    console.log('Old records updated');
  } catch(e) {
    console.error(e);
  }
  await c.end();
}

run();
