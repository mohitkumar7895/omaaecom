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

  console.log("=== STEP 1: Create parent_locations table ===");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS parent_locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      zone_id INT NULL,
      city VARCHAR(100) NOT NULL,
      description TEXT NULL,
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_zone_id (zone_id),
      INDEX idx_city (city),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("parent_locations table ready.");

  console.log("\n=== STEP 2: Create child_avenues table ===");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS child_avenues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_location_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT NULL,
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_parent_avenue (parent_location_id, slug),
      INDEX idx_parent_location (parent_location_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("child_avenues table ready.");

  console.log("\n=== STEP 3: Create child_societies table ===");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS child_societies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_location_id INT NOT NULL,
      child_avenue_id INT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT NULL,
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_parent_society (parent_location_id, slug),
      INDEX idx_parent_location (parent_location_id),
      INDEX idx_child_avenue (child_avenue_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("child_societies table ready.");

  console.log("\n=== STEP 4: Ensure Foreign Reference Columns in sitemap_links ===");
  const [cols] = await conn.query("DESCRIBE sitemap_links");
  const colNames = new Set(cols.map(c => c.Field.toLowerCase()));

  if (!colNames.has('parent_location_id')) {
    console.log("Adding parent_location_id to sitemap_links...");
    await conn.query("ALTER TABLE sitemap_links ADD COLUMN parent_location_id INT DEFAULT NULL");
    await conn.query("CREATE INDEX idx_parent_location_id ON sitemap_links(parent_location_id)");
  }

  if (!colNames.has('child_avenue_id')) {
    console.log("Adding child_avenue_id to sitemap_links...");
    await conn.query("ALTER TABLE sitemap_links ADD COLUMN child_avenue_id INT DEFAULT NULL");
    await conn.query("CREATE INDEX idx_child_avenue_id ON sitemap_links(child_avenue_id)");
  }

  if (!colNames.has('child_society_id')) {
    console.log("Adding child_society_id to sitemap_links...");
    await conn.query("ALTER TABLE sitemap_links ADD COLUMN child_society_id INT DEFAULT NULL");
    await conn.query("CREATE INDEX idx_child_society_id ON sitemap_links(child_society_id)");
  }

  console.log("\n=== STEP 5: Seed Core Parent Locations (Gaur City 2, Gaur City 1, etc.) ===");
  // Find Zone 8 (Noida & Greater Noida West (Gaur City)) if present
  const [zoneRows] = await conn.query("SELECT id FROM service_zones WHERE name LIKE '%Gaur City%' LIMIT 1");
  const gaurZoneId = zoneRows.length > 0 ? zoneRows[0].id : null;

  const parentDefs = [
    {
      name: "Gaur City 2",
      slug: "gaur-city-2",
      zone_id: gaurZoneId,
      city: "Greater Noida West",
      description: "Gaur City 2, Sector 16C, Greater Noida West covering Avenues 1-16 and modern residential high-rise societies."
    },
    {
      name: "Gaur City 1",
      slug: "gaur-city-1",
      zone_id: gaurZoneId,
      city: "Greater Noida West",
      description: "Gaur City 1, Sector 4, Greater Noida West covering 4th to 7th Avenue and surrounding societies."
    },
    {
      name: "Noida Extension",
      slug: "noida-extension",
      zone_id: gaurZoneId,
      city: "Greater Noida West",
      description: "Noida Extension / Greater Noida West covering Sector 1, 4, 16, 16B, 16C, and Techzone 4."
    },
    {
      name: "Greater Noida West",
      slug: "greater-noida-west",
      zone_id: gaurZoneId,
      city: "Greater Noida West",
      description: "Greater Noida West comprehensive doorstep repair zone for all residential sectors and societies."
    }
  ];

  const parentIdMap = {};

  for (const p of parentDefs) {
    const [existing] = await conn.query("SELECT id FROM parent_locations WHERE slug = ?", [p.slug]);
    let pid;
    if (existing.length > 0) {
      pid = existing[0].id;
      await conn.query(
        "UPDATE parent_locations SET name = ?, zone_id = ?, city = ?, description = ?, status = 'Active' WHERE id = ?",
        [p.name, p.zone_id, p.city, p.description, pid]
      );
      console.log(`Updated parent location: ${p.name} (ID: ${pid})`);
    } else {
      const [ins] = await conn.query(
        "INSERT INTO parent_locations (name, slug, zone_id, city, description, status) VALUES (?, ?, ?, ?, ?, 'Active')",
        [p.name, p.slug, p.zone_id, p.city, p.description]
      );
      pid = ins.insertId;
      console.log(`Inserted parent location: ${p.name} (ID: ${pid})`);
    }
    parentIdMap[p.slug] = pid;
  }

  console.log("\n=== STEP 6: Seed Child Avenues for Gaur City 2 ===");
  const gc2Id = parentIdMap["gaur-city-2"];
  const gc2Avenues = [
    { name: "1st Avenue", slug: "1st-avenue" },
    { name: "2nd Avenue", slug: "2nd-avenue" },
    { name: "3rd Avenue", slug: "3rd-avenue" },
    { name: "4th Avenue", slug: "4th-avenue" },
    { name: "5th Avenue", slug: "5th-avenue" },
    { name: "6th Avenue", slug: "6th-avenue" },
    { name: "7th Avenue", slug: "7th-avenue" },
    { name: "8th Avenue", slug: "8th-avenue" },
    { name: "9th Avenue", slug: "9th-avenue" },
    { name: "10th Avenue", slug: "10th-avenue" },
    { name: "11th Avenue", slug: "11th-avenue" },
    { name: "12th Avenue", slug: "12th-avenue" },
    { name: "14th Avenue Phase 1", slug: "14th-avenue-phase-1" },
    { name: "14th Avenue Phase 2", slug: "14th-avenue-phase-2" },
    { name: "16th Avenue", slug: "16th-avenue" }
  ];

  for (const a of gc2Avenues) {
    const [exist] = await conn.query(
      "SELECT id FROM child_avenues WHERE parent_location_id = ? AND slug = ?",
      [gc2Id, a.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_avenues (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [gc2Id, a.name, a.slug, `${a.name} in Gaur City 2, Sector 16C, Greater Noida West`]
      );
      console.log(`Added GC2 Avenue: ${a.name}`);
    }
  }

  console.log("\n=== STEP 7: Seed Child Societies for Gaur City 2 ===");
  const gc2Societies = [
    { name: "White Orchid", slug: "white-orchid" },
    { name: "Divyansh Flora", slug: "divyansh-flora" },
    { name: "Mahagun Mywoods", slug: "mahagun-mywoods" },
    { name: "Palm Olympia", slug: "palm-olympia" },
    { name: "VVIP Homes", slug: "vvip-homes" },
    { name: "Galaxy North Avenue 2", slug: "galaxy-north-avenue-2" },
    { name: "Gaur Smart Homes", slug: "gaur-smart-homes" },
    { name: "Gaur City Arcade", slug: "gaur-city-arcade" }
  ];

  for (const s of gc2Societies) {
    const [exist] = await conn.query(
      "SELECT id FROM child_societies WHERE parent_location_id = ? AND slug = ?",
      [gc2Id, s.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_societies (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [gc2Id, s.name, s.slug, `${s.name} residential society in Gaur City 2`]
      );
      console.log(`Added GC2 Society: ${s.name}`);
    }
  }

  console.log("\n=== STEP 8: Seed Child Avenues & Societies for Gaur City 1 ===");
  const gc1Id = parentIdMap["gaur-city-1"];
  const gc1Avenues = [
    { name: "4th Avenue (GC1)", slug: "4th-avenue-gc1" },
    { name: "5th Avenue (GC1)", slug: "5th-avenue-gc1" },
    { name: "6th Avenue (GC1)", slug: "6th-avenue-gc1" },
    { name: "7th Avenue (GC1)", slug: "7th-avenue-gc1" }
  ];

  for (const a of gc1Avenues) {
    const [exist] = await conn.query(
      "SELECT id FROM child_avenues WHERE parent_location_id = ? AND slug = ?",
      [gc1Id, a.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_avenues (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [gc1Id, a.name, a.slug, `${a.name} in Gaur City 1, Sector 4`]
      );
      console.log(`Added GC1 Avenue: ${a.name}`);
    }
  }

  const gc1Societies = [
    { name: "Gaur Cascades", slug: "gaur-cascades" },
    { name: "Gaur Saundaryam", slug: "gaur-saundaryam" }
  ];

  for (const s of gc1Societies) {
    const [exist] = await conn.query(
      "SELECT id FROM child_societies WHERE parent_location_id = ? AND slug = ?",
      [gc1Id, s.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_societies (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [gc1Id, s.name, s.slug, `${s.name} residential society in Gaur City 1`]
      );
      console.log(`Added GC1 Society: ${s.name}`);
    }
  }

  console.log("\n=== STEP 9: Backfill parent_location_id in sitemap_links where applicable ===");
  await conn.query(
    "UPDATE sitemap_links SET parent_location_id = ? WHERE (slug LIKE '%gaur-city-2%' OR url LIKE '%gaur-city-2%') AND parent_location_id IS NULL",
    [gc2Id]
  );
  await conn.query(
    "UPDATE sitemap_links SET parent_location_id = ? WHERE (slug LIKE '%gaur-city-1%' OR url LIKE '%gaur-city-1%') AND parent_location_id IS NULL",
    [gc1Id]
  );

  console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
  await conn.end();
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});

