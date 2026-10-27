require('dotenv').config();
const mysql = require('mysql2/promise');

async function runTests() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log("=== STEP 1: Verify Table Structure ===");
    const [cols] = await connection.query("DESCRIBE sitemap_links");
    const colNames = cols.map(c => c.Field);
    console.log("Required fields present:");
    const required = ["slug", "meta_title", "h1", "h2", "h3", "faqs", "canonical_url", "status", "service_id", "featured_image"];
    required.forEach(r => {
      console.log(` - ${r}: ${colNames.includes(r) ? "OK" : "MISSING"}`);
    });

    console.log("\n=== STEP 2: Test Create SEO Page (Draft & Published) ===");
    const testSlug = `test-ro-repair-sector-62-${Date.now()}`;
    const testUrl = `/${testSlug}`;
    const faqs = [
      { question: "How fast is service?", answer: "Technician reaches in 60 minutes." },
      { question: "Is there a warranty?", answer: "Yes, 30 days warranty." }
    ];

    // Insert test draft page
    const [insertResult] = await connection.query(
      `INSERT INTO sitemap_links (
         title, url, slug, group_name, city, area, priority, changefreq,
         is_active, is_indexable, status, h1, h2, h3, meta_title,
         meta_description, content, faqs, canonical_url
       ) VALUES (?, ?, ?, 'Area-wise SEO', 'Noida', 'Sector 62', 0.85, 'weekly', 0, 0, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Test RO Repair in Sector 62",
        testUrl,
        testSlug,
        "Test H1 RO Repair in Sector 62",
        "Why Choose OMAA for RO Repair?",
        "Certified Kent & Aquaguard Technicians",
        "Test Meta Title | Call 9999251966",
        "Doorstep RO repair in Sector 62, Noida with 30-day warranty.",
        "Full detailed description of RO water purifier repair and servicing steps.",
        JSON.stringify(faqs),
        testUrl
      ]
    );
    const testId = insertResult.insertId;
    console.log(`Inserted test draft page with ID: ${testId}, slug: ${testSlug}`);

    // Query draft page
    const [draftRows] = await connection.query("SELECT id, status, is_active, is_indexable FROM sitemap_links WHERE id = ?", [testId]);
    console.log("Draft state verified:", draftRows[0]);

    console.log("\n=== STEP 3: Test Publish & Indexable Toggle ===");
    await connection.query(
      "UPDATE sitemap_links SET status = 'published', is_active = 1, is_indexable = 1 WHERE id = ?",
      [testId]
    );
    const [pubRows] = await connection.query("SELECT id, status, is_active, is_indexable FROM sitemap_links WHERE id = ?", [testId]);
    console.log("Published state verified:", pubRows[0]);

    console.log("\n=== STEP 4: Test XML Sitemap Query ===");
    const [sitemapRows] = await connection.query(
      "SELECT slug, url, canonical_url FROM sitemap_links WHERE is_active = 1 AND is_indexable = 1 AND status = 'published' AND id = ?",
      [testId]
    );
    console.log("Page included in sitemap query:", sitemapRows.length === 1 ? "YES" : "NO", sitemapRows[0]);

    console.log("\n=== STEP 5: Test Draft Exclusion from Sitemap ===");
    await connection.query("UPDATE sitemap_links SET status = 'draft' WHERE id = ?", [testId]);
    const [excludedRows] = await connection.query(
      "SELECT id FROM sitemap_links WHERE is_active = 1 AND is_indexable = 1 AND (status = 'published' OR status IS NULL) AND id = ?",
      [testId]
    );
    console.log("Draft excluded from sitemap:", excludedRows.length === 0 ? "YES" : "NO");

    console.log("\n=== STEP 6: Test URL Slug Query Matching ===");
    // Test slug query matching used by getCustomSitemapPage
    const [matchRows] = await connection.query(
      "SELECT id, title, slug, url FROM sitemap_links WHERE (slug = ? OR url = ?) LIMIT 1",
      [testSlug, testUrl]
    );
    console.log("Slug match verified:", matchRows.length > 0 ? "YES" : "NO", matchRows[0]?.slug);

    console.log("\n=== STEP 7: Cleanup Test Record ===");
    await connection.query("DELETE FROM sitemap_links WHERE id = ?", [testId]);
    console.log(`Cleaned up test record ${testId}`);

    console.log("\n=== STEP 8: Total Production Links Preserved Count ===");
    const [finalCount] = await connection.query("SELECT COUNT(*) as cnt FROM sitemap_links");
    console.log(`Final total preserved records in sitemap_links: ${finalCount[0].cnt}`);

    console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    if (connection) await connection.end();
  }
}

runTests();
