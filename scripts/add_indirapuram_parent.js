require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log("=== STEP 1: Find matching Service Zone for Indirapuram ===");
  const [zones] = await conn.query("SELECT id, name, city_names FROM service_zones");
  console.log("Found service zones:", zones.map(z => ({ id: z.id, name: z.name, city_names: z.city_names })));

  // Find Zone 1 Indirapuram or any zone containing Indirapuram
  let targetZone = zones.find(z => z.name.toLowerCase().includes("zone 1") && z.name.toLowerCase().includes("indirapuram"));
  if (!targetZone) {
    targetZone = zones.find(z => z.name.toLowerCase().includes("indirapuram") || (z.city_names && z.city_names.toLowerCase().includes("indirapuram")));
  }

  const zoneId = targetZone ? targetZone.id : null;
  console.log(`Matched Service Zone for Indirapuram: ${targetZone ? targetZone.name : "None"} (ID: ${zoneId})`);

  console.log("\n=== STEP 2: Add Indirapuram to parent_locations ===");
  const parentName = "Indirapuram";
  const parentSlug = "indirapuram";
  const parentCity = "Ghaziabad";
  const description = "Indirapuram, Ghaziabad doorstep appliance repair hub covering all Khands (Ahinsa Khand, Vaibhav Khand, Niti Khand, Nyay Khand, Gyan Khand) and residential societies.";

  const [existing] = await conn.query("SELECT id FROM parent_locations WHERE slug = ?", [parentSlug]);
  let parentId;

  if (existing.length > 0) {
    parentId = existing[0].id;
    await conn.query(
      `UPDATE parent_locations 
       SET name = ?, zone_id = ?, city = ?, description = ?, status = 'Active', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [parentName, zoneId, parentCity, description, parentId]
    );
    console.log(`Updated existing Indirapuram parent location (ID: ${parentId})`);
  } else {
    const [ins] = await conn.query(
      `INSERT INTO parent_locations (name, slug, zone_id, city, description, status) 
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [parentName, parentSlug, zoneId, parentCity, description]
    );
    parentId = ins.insertId;
    console.log(`Inserted Indirapuram as Parent Location (ID: ${parentId})`);
  }

  console.log("\n=== STEP 3: Seed Child Avenues / Khands for Indirapuram ===");
  const indirapuramAvenues = [
    { name: "Ahinsa Khand 1", slug: "ahinsa-khand-1" },
    { name: "Ahinsa Khand 2", slug: "ahinsa-khand-2" },
    { name: "Vaibhav Khand", slug: "vaibhav-khand" },
    { name: "Niti Khand", slug: "niti-khand" },
    { name: "Nyay Khand", slug: "nyay-khand" },
    { name: "Gyan Khand", slug: "gyan-khand" },
  ];

  for (const ave of indirapuramAvenues) {
    const [exist] = await conn.query(
      "SELECT id FROM child_avenues WHERE parent_location_id = ? AND slug = ?",
      [parentId, ave.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_avenues (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [parentId, ave.name, ave.slug, `${ave.name} in Indirapuram, Ghaziabad`]
      );
      console.log(`Added Indirapuram Avenue: ${ave.name}`);
    } else {
      console.log(`Avenue already exists: ${ave.name}`);
    }
  }

  console.log("\n=== STEP 4: Seed Child Societies for Indirapuram ===");
  const indirapuramSocieties = [
    { name: "Shipra Suncity", slug: "shipra-suncity" },
    { name: "ATS Advantage", slug: "ats-advantage" },
    { name: "GC Grand", slug: "gc-grand" },
    { name: "Saya Gold Avenue", slug: "saya-gold-avenue" },
    { name: "Arihant Harmony", slug: "arihant-harmony" },
    { name: "Aditya Mega City", slug: "aditya-mega-city" },
    { name: "Express Garden", slug: "express-garden" },
    { name: "Windsor Park", slug: "windsor-park" }
  ];

  for (const soc of indirapuramSocieties) {
    const [exist] = await conn.query(
      "SELECT id FROM child_societies WHERE parent_location_id = ? AND slug = ?",
      [parentId, soc.slug]
    );
    if (exist.length === 0) {
      await conn.query(
        "INSERT INTO child_societies (parent_location_id, name, slug, description, status) VALUES (?, ?, ?, ?, 'Active')",
        [parentId, soc.name, soc.slug, `${soc.name} residential society in Indirapuram, Ghaziabad`]
      );
      console.log(`Added Indirapuram Society: ${soc.name}`);
    } else {
      console.log(`Society already exists: ${soc.name}`);
    }
  }

  console.log("\n=== STEP 5: Create / Update Indirapuram Base SEO Landing Page ===");
  const parentUrl = `/${parentSlug}`;
  const pageTitle = "Doorstep Appliance Repair in Indirapuram, Ghaziabad";
  const h1 = "Doorstep Appliance Repair in Indirapuram, Ghaziabad";
  const metaDesc = "Verified doorstep RO, AC, Refrigerator & Washing Machine repair across all Khands and societies of Indirapuram, Ghaziabad. Same-day technician within 60-90 minutes with 30-day warranty. Call 9999251966.";

  const defaultFaqs = [
    {
      question: "How fast can a technician reach my address in Indirapuram?",
      answer: "Most doorstep service bookings in Indirapuram (Ahinsa Khand, Vaibhav Khand, Niti Khand, Nyay Khand, Gyan Khand) receive a verified technician within 60 to 90 minutes. Call 9999251966 for immediate priority booking."
    },
    {
      question: "Is there a service warranty on repairs in Indirapuram?",
      answer: "Yes, all completed repairs by OMAA Company include an official 30-day service warranty and brand-certified spare parts."
    },
    {
      question: "Which appliances do you repair in Indirapuram?",
      answer: "We provide comprehensive doorstep repair for RO water purifiers, AC servicing & installation, single/double-door refrigerators, fully automatic & semi-automatic washing machines, and microwave ovens."
    }
  ];

  const [existingSeo] = await conn.query("SELECT id FROM sitemap_links WHERE slug = ? OR url = ?", [parentSlug, parentUrl]);
  if (existingSeo.length > 0) {
    await conn.query(
      `UPDATE sitemap_links SET 
         title = ?, 
         h1 = ?, 
         meta_title = ?, 
         meta_description = ?,
         city = ?, 
         area = ?, 
         zone_id = ?, 
         parent_location_id = ?, 
         page_type = 'location', 
         status = 'published', 
         is_active = 1, 
         is_indexable = 1, 
         canonical_url = ?
       WHERE id = ?`,
      [
        pageTitle, h1, pageTitle, metaDesc, parentCity, parentName, zoneId,
        parentId, parentUrl, existingSeo[0].id
      ]
    );
    console.log(`Updated Indirapuram base SEO page (ID: ${existingSeo[0].id})`);
  } else {
    const [insSeo] = await conn.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, parent_location_id, group_name, city, area, zone_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url
       ) VALUES (
         ?, ?, ?, 'location', NULL, ?, 'Parent Location', ?, ?, ?,
         0.95, 'weekly', 1, 1, FALSE,
         'published', ?, 'Why Choose OMAA Experts in Indirapuram?', 'Genuine Spare Parts & Certified Technicians with 30-Day Warranty',
         ?, ?, ?, ?, ?, ?
       )`,
      [
        pageTitle, parentUrl, parentSlug, parentId, parentCity, parentName, zoneId,
        h1, pageTitle, metaDesc, metaDesc,
        description, JSON.stringify(defaultFaqs), parentUrl
      ]
    );
    console.log(`Created Indirapuram base SEO page (ID: ${insSeo.insertId})`);
  }

  console.log("\n=== SUCCESS: Indirapuram configured as independent Parent Location! ===");
  await conn.end();
}

main().catch(err => {
  console.error("Error executing add_indirapuram_parent:", err);
  process.exit(1);
});

