const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function syncServicesUrl() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    await pool.query(`
      INSERT INTO sitemap_links (title, url, group_name, priority, changefreq, is_active, is_system)
      VALUES ('All Appliance Repair Services - RO, Fridge, Washing Machine', '/services', 'Main Pages', 0.9, 'daily', TRUE, TRUE)
      ON DUPLICATE KEY UPDATE title = VALUES(title), priority = VALUES(priority), changefreq = VALUES(changefreq)
    `);
    console.log('✅ Added /services to sitemap_links in DB');

    const [rows] = await pool.query(
      "SELECT title, url FROM sitemap_links WHERE url IN ('/services', '/services/5', '/services/2', '/services/3', '/services/7')"
    );
    console.log('Key sitemap links in DB:', rows);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
syncServicesUrl();
