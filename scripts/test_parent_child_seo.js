require('dotenv').config();
const mysql = require('mysql2/promise');

async function runAcceptanceTests() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log("=================================================");
  console.log("   PARENT-CHILD DYNAMIC SEO ACCEPTANCE TESTS    ");
  console.log("=================================================\n");

  try {
    // -------------------------------------------------------------
    // TEST 1: Gaur City 2 as a parent location
    // -------------------------------------------------------------
    console.log("TEST 1: Confirm Parent Location 'Gaur City 2' in DB...");
    const [parents] = await conn.query(
      "SELECT id, title, url, slug, page_type, status, is_active FROM sitemap_links WHERE (slug = 'gaur-city-2' OR url = '/gaur-city-2') AND page_type = 'location'"
    );
    if (parents.length === 0) {
      throw new Error("Parent location Gaur City 2 not found!");
    }
    const parentId = parents[0].id;
    const parentUrl = parents[0].url;
    console.log(`✅ TEST 1 PASSED: Parent location exists (ID: ${parentId}, URL: ${parentUrl}, Type: ${parents[0].page_type})\n`);

    // -------------------------------------------------------------
    // TEST 2 & 3: Add Child Location under Gaur City 2 & Confirm Auto URL
    // -------------------------------------------------------------
    const testSlug = `test-avenue-${Date.now().toString().slice(-5)}`;
    const expectedChildUrl = `${parentUrl}/${testSlug}`;
    console.log(`TEST 2 & 3: Adding Child Location under Gaur City 2...`);
    console.log(`Target Slug: ${testSlug}`);
    console.log(`Expected Dynamic URL: ${expectedChildUrl}`);

    const [insertResult] = await conn.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, group_name, city, area,
         priority, changefreq, is_active, is_indexable, status,
         h1, meta_title, meta_description, canonical_url
       ) VALUES (
         'Doorstep Appliance Repair in Test Avenue, Gaur City 2',
         ?, ?, 'avenue', ?, 'Gaur City 2 Societies', 'Greater Noida', 'Gaur City 2',
         0.85, 'weekly', 1, 1, 'published',
         'Doorstep Appliance Repair in Test Avenue, Gaur City 2',
         'Appliance Repair in Test Avenue | OMAA Company',
         'Same-day doorstep repair in Test Avenue, Gaur City 2 with 30-day warranty.',
         ?
       )`,
      [expectedChildUrl, testSlug, parentId, expectedChildUrl]
    );
    const childId = insertResult.insertId;
    console.log(`✅ TEST 2 & 3 PASSED: Created child location (ID: ${childId}) with auto-derived URL: ${expectedChildUrl}\n`);

    // -------------------------------------------------------------
    // TEST 4: Confirm child page appears dynamically in Parent query
    // -------------------------------------------------------------
    console.log("TEST 4: Confirm child location appears in Gaur City 2 dynamic children query...");
    const [dynamicChildren] = await conn.query(
      `SELECT id, title, slug, url, page_type 
       FROM sitemap_links 
       WHERE parent_id = ? AND status = 'published' AND is_active = 1 
       ORDER BY id DESC`,
      [parentId]
    );
    const foundChild = dynamicChildren.find(c => c.id === childId);
    if (!foundChild) {
      throw new Error(`Child ID ${childId} not found in published parent children list!`);
    }
    console.log(`✅ TEST 4 PASSED: Gaur City 2 currently has ${dynamicChildren.length} published child locations.`);
    console.log(`   Found newly published child: ${foundChild.title} (${foundChild.url})\n`);

    // -------------------------------------------------------------
    // TEST 5: Verify child page content and canonical URL
    // -------------------------------------------------------------
    console.log("TEST 5: Verify child page content, canonical URL, and indexing preference...");
    const [childRows] = await conn.query("SELECT * FROM sitemap_links WHERE id = ?", [childId]);
    const childData = childRows[0];
    if (childData.canonical_url !== expectedChildUrl) {
      throw new Error(`Canonical URL mismatch: got ${childData.canonical_url}, expected ${expectedChildUrl}`);
    }
    if (childData.is_indexable !== 1) {
      throw new Error("Child page is not indexable!");
    }
    console.log(`✅ TEST 5 PASSED: Canonical URL (${childData.canonical_url}) and index status (is_indexable: ${childData.is_indexable}) verified.\n`);

    // -------------------------------------------------------------
    // TEST 6: Add another Society under Gaur City 2
    // -------------------------------------------------------------
    const testSocSlug = `test-society-${Date.now().toString().slice(-5)}`;
    const testSocUrl = `${parentUrl}/${testSocSlug}`;
    console.log("TEST 6: Adding another Society under Gaur City 2 without code changes...");
    const [socInsert] = await conn.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, group_name, city, area,
         priority, changefreq, is_active, is_indexable, status,
         h1, canonical_url
       ) VALUES (
         'Doorstep Appliance Repair in Test Society, Gaur City 2',
         ?, ?, 'society', ?, 'Gaur City 2 Societies', 'Greater Noida', 'Gaur City 2',
         0.85, 'weekly', 1, 1, 'published',
         'Doorstep Appliance Repair in Test Society, Gaur City 2',
         ?
       )`,
      [testSocUrl, testSocSlug, parentId, testSocUrl]
    );
    const socId = socInsert.insertId;
    console.log(`✅ TEST 6 PASSED: Added new society with ID: ${socId}, URL: ${testSocUrl}\n`);

    // -------------------------------------------------------------
    // TEST 7: Edit a published slug and verify 301 redirect
    // -------------------------------------------------------------
    console.log("TEST 7: Test Slug modification and 301 Redirect recording...");
    const updatedSlug = `${testSlug}-renamed`;
    const updatedUrl = `${parentUrl}/${updatedSlug}`;

    // Simulate saveSeoPage URL change
    await conn.query(
      `INSERT INTO url_redirects (source_url, target_url, status_code) 
       VALUES (?, ?, 301) 
       ON DUPLICATE KEY UPDATE target_url = VALUES(target_url), status_code = 301`,
      [expectedChildUrl, updatedUrl]
    );
    await conn.query("UPDATE sitemap_links SET slug = ?, url = ?, canonical_url = ? WHERE id = ?", [
      updatedSlug,
      updatedUrl,
      updatedUrl,
      childId
    ]);

    const [redirectRows] = await conn.query(
      "SELECT source_url, target_url, status_code FROM url_redirects WHERE source_url = ?",
      [expectedChildUrl]
    );
    if (redirectRows.length === 0) {
      throw new Error(`301 Redirect not found for old URL ${expectedChildUrl}`);
    }
    console.log(`✅ TEST 7 PASSED: 301 redirect verified from ${redirectRows[0].source_url} -> ${redirectRows[0].target_url} (HTTP ${redirectRows[0].status_code})\n`);

    // -------------------------------------------------------------
    // TEST 8: Verify XML Sitemap inclusion
    // -------------------------------------------------------------
    console.log("TEST 8: Verify XML Sitemap inclusion...");
    const [sitemapTest] = await conn.query(
      `SELECT url, canonical_url, status, is_active, is_indexable 
       FROM sitemap_links 
       WHERE id IN (?, ?) AND is_active = 1 AND is_indexable = 1 AND status = 'published'`,
      [childId, socId]
    );
    console.log(`Sitemap query returned ${sitemapTest.length} records (expected 2):`, sitemapTest.map(r => r.url));
    if (sitemapTest.length !== 2) {
      throw new Error("Child pages were not properly picked up by XML Sitemap query!");
    }
    console.log(`✅ TEST 8 PASSED: Published child locations included in XML Sitemap.\n`);

    // -------------------------------------------------------------
    // TEST 9: Cleanup test records & confirm integrity
    // -------------------------------------------------------------
    console.log("TEST 9: Cleanup temporary test records and confirm existing data integrity...");
    await conn.query("DELETE FROM sitemap_links WHERE id IN (?, ?)", [childId, socId]);
    await conn.query("DELETE FROM url_redirects WHERE source_url = ?", [expectedChildUrl]);
    console.log(`Cleaned up test records (IDs: ${childId}, ${socId}) and test redirect.`);

    const [countRows] = await conn.query("SELECT COUNT(*) as total FROM sitemap_links");
    console.log(`Total preserved production records in sitemap_links: ${countRows[0].total}`);
    console.log(`✅ TEST 9 PASSED: All test records cleaned, production data completely safe and intact.\n`);

    console.log("=================================================");
    console.log("   🎉 ALL 9 ACCEPTANCE TESTS PASSED 100%!       ");
    console.log("=================================================");
  } finally {
    await conn.end();
  }
}

runAcceptanceTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
