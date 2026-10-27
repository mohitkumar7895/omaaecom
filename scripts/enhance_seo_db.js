require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log("Connected to MySQL database.");

    // Check existing columns
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sitemap_links'
    `, [process.env.DB_NAME]);

    const existingCols = new Set(cols.map(c => c.COLUMN_NAME.toLowerCase()));
    console.log("Existing columns in sitemap_links count:", existingCols.size);

    const columnsToAdd = [
      { name: "slug", sql: "ALTER TABLE sitemap_links ADD COLUMN slug VARCHAR(255) DEFAULT NULL" },
      { name: "meta_title", sql: "ALTER TABLE sitemap_links ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL" },
      { name: "h1", sql: "ALTER TABLE sitemap_links ADD COLUMN h1 VARCHAR(255) DEFAULT NULL" },
      { name: "h2", sql: "ALTER TABLE sitemap_links ADD COLUMN h2 VARCHAR(255) DEFAULT NULL" },
      { name: "h3", sql: "ALTER TABLE sitemap_links ADD COLUMN h3 VARCHAR(255) DEFAULT NULL" },
      { name: "faqs", sql: "ALTER TABLE sitemap_links ADD COLUMN faqs JSON DEFAULT NULL" },
      { name: "canonical_url", sql: "ALTER TABLE sitemap_links ADD COLUMN canonical_url VARCHAR(500) DEFAULT NULL" },
      { name: "status", sql: "ALTER TABLE sitemap_links ADD COLUMN status ENUM('draft', 'published') DEFAULT 'published'" },
      { name: "service_id", sql: "ALTER TABLE sitemap_links ADD COLUMN service_id INT DEFAULT NULL" },
      { name: "zone_id", sql: "ALTER TABLE sitemap_links ADD COLUMN zone_id INT DEFAULT NULL" },
      { name: "featured_image", sql: "ALTER TABLE sitemap_links ADD COLUMN featured_image VARCHAR(500) DEFAULT NULL" }
    ];

    for (const col of columnsToAdd) {
      if (!existingCols.has(col.name.toLowerCase())) {
        console.log(`Adding column: ${col.name}`);
        await connection.query(col.sql);
        console.log(`Column ${col.name} added successfully.`);
      } else {
        console.log(`Column ${col.name} already exists, skipping.`);
      }
    }

    // Add index on slug if not exists
    const [indexes] = await connection.query(`
      SHOW INDEX FROM sitemap_links WHERE Key_name = 'idx_slug'
    `);
    if (indexes.length === 0) {
      console.log("Adding index idx_slug on sitemap_links(slug)...");
      await connection.query("CREATE INDEX idx_slug ON sitemap_links(slug)");
      console.log("Index idx_slug added.");
    }

    // Backfill slug for existing rows where slug is NULL or empty
    console.log("Backfilling slug for existing rows where slug is empty...");
    await connection.query(`
      UPDATE sitemap_links 
      SET slug = TRIM(BOTH '/' FROM REPLACE(url, '/sitemap/', '')) 
      WHERE (slug IS NULL OR slug = '') AND url != '/' AND url NOT LIKE 'http%'
    `);

    // Backfill h1 from heading if empty
    await connection.query(`
      UPDATE sitemap_links 
      SET h1 = heading 
      WHERE (h1 IS NULL OR h1 = '') AND heading IS NOT NULL AND heading != ''
    `);

    // Backfill meta_title from title if empty
    await connection.query(`
      UPDATE sitemap_links 
      SET meta_title = title 
      WHERE (meta_title IS NULL OR meta_title = '') AND title IS NOT NULL AND title != ''
    `);

    console.log("Migration completed safely. Verifying count and sample row...");
    const [countRes] = await connection.query("SELECT COUNT(*) as cnt FROM sitemap_links");
    console.log(`Total rows preserved: ${countRes[0].cnt}`);

    const [sample] = await connection.query("SELECT id, title, url, slug, h1, status, is_active FROM sitemap_links LIMIT 3");
    console.log("Sample updated records:", sample);

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
