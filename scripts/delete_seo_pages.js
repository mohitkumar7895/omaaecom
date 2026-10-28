require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log("=== 1. Checking current counts by group_name ===");
  const [before] = await conn.query('SELECT group_name, count(*) as count FROM sitemap_links GROUP BY group_name');
  console.table(before);

  console.log("\n=== 2. Deleting SEO pages from sitemap_links ===");
  const [delResult] = await conn.query(`
    DELETE FROM sitemap_links 
    WHERE group_name IN ('Area-wise SEO', 'Gaur City 2 Societies', 'Keyword SEO')
       OR url = '/sitemap/gaur-city-1-2'
       OR url LIKE '/sitemap/%'
       OR page_type IN ('location', 'avenue', 'society')
  `);
  console.log('✅ Deleted SEO rows count:', delResult.affectedRows);

  console.log("\n=== 3. Ensuring Home page (/) is properly in Main Pages ===");
  await conn.query(`
    INSERT INTO sitemap_links (title, url, slug, group_name, priority, changefreq, is_active, is_indexable, is_system, status)
    VALUES ('Home - Doorstep Appliance Repair & Maintenance', '/', '', 'Main Pages', 1.0, 'daily', 1, 1, 1, 'published')
    ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), priority = VALUES(priority), is_active = 1, is_indexable = 1, status = 'published'
  `);

  console.log("\n=== 4. Remaining sitemap_links ===");
  const [after] = await conn.query('SELECT id, title, url, group_name, is_system FROM sitemap_links ORDER BY group_name, id');
  console.table(after);
  console.log('Total remaining count:', after.length);

  await conn.end();
}

run().catch((err) => {
  console.error("Error executing delete script:", err);
  process.exit(1);
});

