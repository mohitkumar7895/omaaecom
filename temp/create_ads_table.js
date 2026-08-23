const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ommaecom'
  });
  
  await c.query(`
    CREATE TABLE IF NOT EXISTS cashback_ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_type VARCHAR(20) NOT NULL DEFAULT 'video',
      media_urls JSON,
      duration INT DEFAULT 20,
      is_active BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Insert a default row if none exists
  const [rows] = await c.query('SELECT COUNT(*) as count FROM cashback_ads');
  if (rows[0].count === 0) {
    await c.query(`
      INSERT INTO cashback_ads (ad_type, duration, media_urls) 
      VALUES ('video', 20, '[]')
    `);
  }
  
  console.log('Table created successfully');
  await c.end();
}
run().catch(console.error);
