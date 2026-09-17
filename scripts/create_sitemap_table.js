const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log("Connecting to database...");

    // 1. Create sitemap_links table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sitemap_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL UNIQUE,
        group_name VARCHAR(100) DEFAULT 'General',
        city VARCHAR(100) DEFAULT NULL,
        area VARCHAR(150) DEFAULT NULL,
        category_id INT DEFAULT NULL,
        priority DECIMAL(2, 1) DEFAULT 0.8,
        changefreq VARCHAR(20) DEFAULT 'weekly',
        is_active BOOLEAN DEFAULT TRUE,
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group (group_name),
        INDEX idx_active (is_active),
        INDEX idx_city (city)
      );
    `;
    await pool.query(createTableQuery);
    console.log("✅ Created sitemap_links table successfully.");

    // 2. Default Static / Main System Pages
    const staticPages = [
      { title: "Home - Doorstep Appliance Repair & Maintenance", url: "/", group_name: "Main Pages", priority: 1.0, changefreq: "daily", is_system: true },
      { title: "About Us - OMAA Company", url: "/about", group_name: "Main Pages", priority: 0.8, changefreq: "monthly", is_system: true },
      { title: "Contact Us & Support", url: "/contact", group_name: "Main Pages", priority: 0.8, changefreq: "monthly", is_system: true },
      { title: "Rate Card - Transparent Service Pricing", url: "/rate-card", group_name: "Main Pages", priority: 0.8, changefreq: "weekly", is_system: true },
      { title: "Lodge Complaint & Grievance", url: "/complaint", group_name: "Main Pages", priority: 0.7, changefreq: "monthly", is_system: true },
      { title: "Professional Service Partner Registration", url: "/registration_form.php", group_name: "Main Pages", priority: 0.7, changefreq: "monthly", is_system: true },
      { title: "Privacy Policy", url: "/privacy-policy", group_name: "Legal & Policies", priority: 0.5, changefreq: "yearly", is_system: true },
      { title: "Terms & Conditions", url: "/terms-and-conditions", group_name: "Legal & Policies", priority: 0.5, changefreq: "yearly", is_system: true },
      { title: "Sitemap Directory", url: "/sitemap", group_name: "Main Pages", priority: 0.6, changefreq: "weekly", is_system: true },
    ];

    for (const p of staticPages) {
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, priority, changefreq, is_active, is_system)
         VALUES (?, ?, ?, ?, ?, TRUE, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), priority = VALUES(priority)`,
        [p.title, p.url, p.group_name, p.priority, p.changefreq, p.is_system]
      );
    }
    console.log(`✅ Seeded ${staticPages.length} core system pages.`);

    // 3. Auto-import active categories as service links
    const [categories] = await pool.query("SELECT id, title, type FROM categories WHERE status = 'Active'");
    console.log(`Found ${categories.length} active categories.`);

    for (const cat of categories) {
      const url = `/services/${cat.id}`;
      const title = `${cat.title} - Doorstep Repair & Services`;
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, category_id, priority, changefreq, is_active, is_system)
         VALUES (?, ?, 'Services', ?, 0.9, 'weekly', TRUE, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), category_id = VALUES(category_id)`,
        [title, url, cat.id]
      );
    }
    console.log(`✅ Synced ${categories.length} categories to sitemap_links.`);

    // 4. Seed initial Area-wise SEO URLs (Noida, Greater Noida, Delhi, Ghaziabad, Gurgaon)
    const initialAreas = [
      { city: "Noida", area: "Noida Sector 62", title: "AC & Appliance Repair in Noida Sector 62", url: "/noida?area=sector-62" },
      { city: "Noida", area: "Gaur City 2", title: "Appliance Services & RO AMC in Gaur City 2", url: "/noida?area=gaur-city-2" },
      { city: "Greater Noida", area: "Pari Chowk", title: "Appliance Repair Services in Pari Chowk Greater Noida", url: "/greater-noida?area=pari-chowk" },
      { city: "Ghaziabad", area: "Indirapuram", title: "AC, RO & Refrigerator Repair in Indirapuram Ghaziabad", url: "/ghaziabad?area=indirapuram" },
      { city: "Ghaziabad", area: "Vaishali", title: "Home Appliance Repair & Maintenance in Vaishali", url: "/ghaziabad?area=vaishali" },
      { city: "Delhi", area: "Mayur Vihar", title: "Doorstep Appliance Services in Mayur Vihar Delhi", url: "/delhi?area=mayur-vihar" },
      { city: "Noida", area: "Noida All Sectors", title: "Top Rated Home Appliance Repair in Noida", url: "/noida" },
      { city: "Delhi", area: "Delhi NCR", title: "Doorstep Home Appliance Repair in Delhi NCR", url: "/delhi" },
      { city: "Ghaziabad", area: "Ghaziabad", title: "Reliable Appliance Repair in Ghaziabad", url: "/ghaziabad" },
    ];

    for (const a of initialAreas) {
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system)
         VALUES (?, ?, 'Area-wise SEO', ?, ?, 0.8, 'weekly', TRUE, FALSE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), city = VALUES(city), area = VALUES(area)`,
        [a.title, a.url, a.city, a.area]
      );
    }
    console.log(`✅ Seeded ${initialAreas.length} initial Area-wise SEO links.`);

    const [totalRows] = await pool.query("SELECT COUNT(*) as count FROM sitemap_links");
    console.log(`🎉 Total sitemap links now in database: ${totalRows[0].count}`);

  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
