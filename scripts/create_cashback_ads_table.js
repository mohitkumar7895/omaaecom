const mysql = require('../node_modules/mysql2/promise');

async function createCashbackAdsTable() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ommaecom'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cashback_ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_type VARCHAR(50) DEFAULT 'video',
      media_urls LONGTEXT,
      duration INT DEFAULT 20,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('cashback_ads table created successfully!');

  // Check if any rows exist
  const [rows] = await conn.query('SELECT * FROM cashback_ads');
  console.log('Current cashback_ads records:', rows);

  await conn.end();
}

createCashbackAdsTable().catch(console.error);
