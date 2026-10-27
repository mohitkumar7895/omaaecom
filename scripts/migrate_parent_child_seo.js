require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log("=== STEP 1: Add parent_id and page_type columns to sitemap_links ===");
  const [cols] = await conn.query("DESCRIBE sitemap_links");
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('parent_id')) {
    console.log("Adding parent_id column...");
    await conn.query("ALTER TABLE sitemap_links ADD COLUMN parent_id INT DEFAULT NULL");
    await conn.query("CREATE INDEX idx_parent_id ON sitemap_links(parent_id)");
    console.log("Added parent_id column and index.");
  } else {
    console.log("parent_id column already exists.");
  }

  if (!colNames.includes('page_type')) {
    console.log("Adding page_type column...");
    await conn.query("ALTER TABLE sitemap_links ADD COLUMN page_type ENUM('location', 'avenue', 'society', 'service') DEFAULT 'service'");
    await conn.query("CREATE INDEX idx_page_type ON sitemap_links(page_type)");
    console.log("Added page_type column and index.");
  } else {
    console.log("page_type column already exists.");
  }

  console.log("\n=== STEP 2: Create url_redirects table ===");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS url_redirects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_url VARCHAR(500) NOT NULL UNIQUE,
      target_url VARCHAR(500) NOT NULL,
      status_code INT DEFAULT 301,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_source (source_url)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("url_redirects table verified.");

  console.log("\n=== STEP 3: Ensure Gaur City 2 Parent Location in sitemap_links ===");
  const [parentRows] = await conn.query("SELECT id FROM sitemap_links WHERE slug = 'gaur-city-2' OR url = '/gaur-city-2'");
  let parentId;

  if (parentRows.length > 0) {
    parentId = parentRows[0].id;
    console.log(`Found existing Gaur City 2 record with ID: ${parentId}. Updating page_type='location'...`);
    await conn.query(
      `UPDATE sitemap_links SET 
         page_type = 'location', 
         title = 'Doorstep Appliance Repair in Gaur City 2, Noida Extension',
         h1 = 'Doorstep Appliance Repair in Gaur City 2, Noida Extension',
         city = 'Greater Noida',
         area = 'Gaur City 2',
         group_name = 'Parent Location',
         status = 'published',
         is_active = 1,
         is_indexable = 1,
         canonical_url = '/gaur-city-2'
       WHERE id = ?`,
      [parentId]
    );
  } else {
    console.log("Inserting Gaur City 2 Parent Location record...");
    const [res] = await conn.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, group_name, city, area,
         priority, changefreq, is_active, is_indexable, is_system, status,
         h1, meta_title, meta_description, canonical_url
       ) VALUES (
         'Doorstep Appliance Repair in Gaur City 2, Noida Extension',
         '/gaur-city-2',
         'gaur-city-2',
         'location',
         NULL,
         'Parent Location',
         'Greater Noida',
         'Gaur City 2',
         0.95,
         'weekly',
         1,
         1,
         TRUE,
         'published',
         'Doorstep Appliance Repair in Gaur City 2, Noida Extension',
         'Doorstep Appliance Repair in Gaur City 2 | RO, AC, Washing Machine',
         'Expert technicians for RO water purifiers, AC servicing & washing machines across all Gaur City 2 avenues and Sector 16C societies in Greater Noida West.',
         '/gaur-city-2'
       )`
    );
    parentId = res.insertId;
    console.log(`Created Gaur City 2 Parent Location with ID: ${parentId}`);
  }

  console.log("\n=== STEP 4: Seed Gaur City 2 Child Societies ===");
  const initialSocieties = [
    { slug: "10th-avenue", name: "10th Avenue / Sanskriti Vihar", type: "avenue" },
    { slug: "11th-avenue", name: "11th Avenue", type: "avenue" },
    { slug: "12th-avenue", name: "12th Avenue", type: "avenue" },
    { slug: "14th-avenue-phase-1", name: "14th Avenue – Phase I", type: "avenue" },
    { slug: "14th-avenue-phase-2", name: "14th Avenue – Phase II", type: "avenue" },
    { slug: "16th-avenue", name: "16th Avenue", type: "avenue" },
    { slug: "white-orchid", name: "White Orchid", type: "society" },
    { slug: "divyansh-flora", name: "Divyansh Flora", type: "society" },
    { slug: "mahagun-mywoods", name: "Mahagun Mywoods", type: "society" },
    { slug: "palm-olympia", name: "Palm Olympia", type: "society" },
    { slug: "vvip-homes", name: "VVIP Homes", type: "society" },
    { slug: "galaxy-north-avenue-2", name: "Galaxy North Avenue 2", type: "society" },
    { slug: "gaur-smart-homes", name: "Gaur Smart Homes", type: "society" },
    { slug: "gaur-city-arcade", name: "Gaur City Arcade", type: "society" }
  ];

  for (const soc of initialSocieties) {
    const childUrl = `/gaur-city-2/${soc.slug}`;
    const pageTitle = `Doorstep Appliance Repair in ${soc.name}, Gaur City 2`;
    const h1 = `Doorstep Appliance Repair in ${soc.name}, Gaur City 2`;
    const metaDesc = `Doorstep RO, AC, Refrigerator & Washing Machine repair in ${soc.name}, Gaur City 2, Noida Extension. Certified local technicians, same-day service, 30-day warranty. Call 9999251966.`;

    const [existing] = await conn.query("SELECT id FROM sitemap_links WHERE url = ?", [childUrl]);

    if (existing.length > 0) {
      await conn.query(
        `UPDATE sitemap_links SET 
           parent_id = ?, 
           page_type = ?, 
           title = ?, 
           h1 = ?, 
           meta_title = ?, 
           meta_description = ?,
           city = 'Greater Noida',
           area = 'Gaur City 2',
           group_name = 'Gaur City 2 Societies',
           status = 'published',
           is_active = 1,
           is_indexable = 1,
           canonical_url = ?
         WHERE id = ?`,
        [parentId, soc.type, pageTitle, h1, pageTitle, metaDesc, childUrl, existing[0].id]
      );
      console.log(`Updated child location: ${soc.name} -> ${childUrl} (ID: ${existing[0].id})`);
    } else {
      const [insertRes] = await conn.query(
        `INSERT INTO sitemap_links (
           title, url, slug, page_type, parent_id, group_name, city, area,
           priority, changefreq, is_active, is_indexable, is_system, status,
           h1, meta_title, meta_description, canonical_url
         ) VALUES (
           ?, ?, ?, ?, ?, 'Gaur City 2 Societies', 'Greater Noida', 'Gaur City 2',
           0.85, 'weekly', 1, 1, FALSE, 'published',
           ?, ?, ?, ?
         )`,
        [pageTitle, childUrl, soc.slug, soc.type, parentId, h1, pageTitle, metaDesc, childUrl]
      );
      console.log(`Inserted child location: ${soc.name} -> ${childUrl} (ID: ${insertRes.insertId})`);
    }
  }

  console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
  await conn.end();
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
