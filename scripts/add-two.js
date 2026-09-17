const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'ommaecom' });
  await pool.query("INSERT INTO subcategories (category_id, title) VALUES (7, 'Local / Non-branded'), (7, 'Branded')");
  console.log('Added successfully');
  process.exit(0);
}
run();
