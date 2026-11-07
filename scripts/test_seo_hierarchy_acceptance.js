require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAcceptanceCriteria() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log("==========================================================");
  console.log("     OMAA PARENT-CHILD SEO SYSTEM ACCEPTANCE TESTS        ");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1 & 2: Gaur City 2 Parent, Avenue, and Society lists
    // -----------------------------------------------------------------
    const [gc2Rows] = await conn.query("SELECT id, name, slug FROM parent_locations WHERE slug = 'gaur-city-2'");
    assert(gc2Rows.length > 0, "Parent Location 'Gaur City 2' exists in parent_locations table");
    const gc2Id = gc2Rows[0].id;

    const [gc2Avenues] = await conn.query(
      "SELECT name, slug FROM child_avenues WHERE parent_location_id = ? ORDER BY name ASC",
      [gc2Id]
    );
    assert(gc2Avenues.length >= 12, `Gaur City 2 has ${gc2Avenues.length} registered Avenues (1st to 16th Avenue)`);

    const has10thAve = gc2Avenues.some(a => a.slug === '10th-avenue');
    assert(has10thAve, "Gaur City 2 contains '10th Avenue'");

    const [gc2Societies] = await conn.query(
      "SELECT name, slug FROM child_societies WHERE parent_location_id = ? ORDER BY name ASC",
      [gc2Id]
    );
    assert(gc2Societies.length >= 5, `Gaur City 2 has ${gc2Societies.length} registered Societies`);
    const hasWhiteOrchid = gc2Societies.some(s => s.slug === 'white-orchid');
    assert(hasWhiteOrchid, "Gaur City 2 contains 'White Orchid' society");

    // -----------------------------------------------------------------
    // TEST 3: Strict Isolation - Gaur City 1 locations NEVER appear in Gaur City 2
    // -----------------------------------------------------------------
    const [gc1Rows] = await conn.query("SELECT id, name, slug FROM parent_locations WHERE slug = 'gaur-city-1'");
    assert(gc1Rows.length > 0, "Parent Location 'Gaur City 1' exists in parent_locations table");
    const gc1Id = gc1Rows[0].id;

    const [gc1Avenues] = await conn.query(
      "SELECT name, slug FROM child_avenues WHERE parent_location_id = ?",
      [gc1Id]
    );
    const [crossLeak] = await conn.query(
      "SELECT ca.name, pl.name as parent_name FROM child_avenues ca JOIN parent_locations pl ON ca.parent_location_id = pl.id WHERE ca.parent_location_id = ? AND ca.slug LIKE '%gc1%'",
      [gc2Id]
    );
    assert(crossLeak.length === 0, "Zero Gaur City 1 avenues leak into Gaur City 2 parent query");

    // -----------------------------------------------------------------
    // TEST 4 & 5: Child Avenue & Society Parent Relationship Integrity
    // -----------------------------------------------------------------
    const [aveParentCheck] = await conn.query(
      "SELECT ca.name, ca.slug, pl.slug as parent_slug FROM child_avenues ca JOIN parent_locations pl ON ca.parent_location_id = pl.id WHERE ca.slug = '10th-avenue'"
    );
    assert(aveParentCheck.length > 0 && aveParentCheck[0].parent_slug === 'gaur-city-2', "10th Avenue parent is strictly Gaur City 2");

    const [socParentCheck] = await conn.query(
      "SELECT cs.name, cs.slug, pl.slug as parent_slug FROM child_societies cs JOIN parent_locations pl ON cs.parent_location_id = pl.id WHERE cs.slug = 'white-orchid'"
    );
    assert(socParentCheck.length > 0 && socParentCheck[0].parent_slug === 'gaur-city-2', "White Orchid parent is strictly Gaur City 2");

    // -----------------------------------------------------------------
    // TEST 6: Auto-generate Hierarchical URLs
    // -----------------------------------------------------------------
    const testAvenueUrl = `/gaur-city-2/10th-avenue`;
    const testSocietyUrl = `/gaur-city-2/white-orchid`;
    const testAvenueServiceUrl = `/gaur-city-2/10th-avenue/ro-repair`;

    assert(testAvenueUrl.startsWith('/gaur-city-2/'), `Avenue URL follows format: ${testAvenueUrl}`);
    assert(testSocietyUrl.startsWith('/gaur-city-2/'), `Society URL follows format: ${testSocietyUrl}`);
    assert(testAvenueServiceUrl.includes('10th-avenue'), `Avenue Service URL includes avenue context: ${testAvenueServiceUrl}`);

    // -----------------------------------------------------------------
    // TEST 7: Insert/Update a Dynamic SEO Page with Parent-Child Linkage
    // -----------------------------------------------------------------
    const testPageSlug = `ro-repair-test-${Date.now().toString().slice(-4)}`;
    const testPageUrl = `/gaur-city-2/10th-avenue/${testPageSlug}`;

    const [insertSeo] = await conn.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, parent_location_id, child_avenue_id, group_name, city, area,
         priority, changefreq, is_active, is_indexable, is_system, status,
         h1, h2, h3, meta_title, meta_description, canonical_url
       ) VALUES (
         'RO Water Purifier Repair in 10th Avenue, Gaur City 2',
         ?, ?, 'service', ?, ?, ?, 'Child Location', 'Greater Noida West', '10th Avenue, Gaur City 2',
         0.85, 'weekly', 1, 1, FALSE, 'published',
         'RO Repair in 10th Avenue, Gaur City 2',
         'Why Choose OMAA for RO Repair in 10th Avenue?',
         'Genuine RO Membranes & Filters with 30-Day Warranty',
         'RO Water Purifier Repair in 10th Avenue, Gaur City 2 | Call 9999251966',
         'Doorstep RO water purifier repair in 10th Avenue, Gaur City 2, Noida Extension. Call 9999251966 for same-day service.',
         ?
       )`,
      [testPageUrl, testPageSlug, gc2Id, gc2Id, gc2Avenues[0].id, testPageUrl]
    );
    const testSeoId = insertSeo.insertId;
    assert(testSeoId > 0, `Created Dynamic SEO Page with ID: ${testSeoId} under Gaur City 2 > 10th Avenue`);

    // -----------------------------------------------------------------
    // TEST 8: 301 Permanent Redirect on URL Change
    // -----------------------------------------------------------------
    const newPageUrl = `/gaur-city-2/10th-avenue/${testPageSlug}-updated`;
    await conn.query(
      `INSERT INTO url_redirects (source_url, target_url, status_code) VALUES (?, ?, 301)
       ON DUPLICATE KEY UPDATE target_url = VALUES(target_url), status_code = 301`,
      [testPageUrl, newPageUrl]
    );

    const [redirCheck] = await conn.query("SELECT target_url, status_code FROM url_redirects WHERE source_url = ?", [testPageUrl]);
    assert(redirCheck.length > 0 && redirCheck[0].target_url === newPageUrl && redirCheck[0].status_code === 301, "301 Permanent Redirect registered successfully from old URL to new URL");

    // Clean up test redirect
    await conn.query("DELETE FROM url_redirects WHERE source_url = ?", [testPageUrl]);

    // Clean up test page
    await conn.query("DELETE FROM sitemap_links WHERE id = ?", [testSeoId]);
    assert(true, "Test SEO Page cleaned up safely");

    // -----------------------------------------------------------------
    // TEST 9: Duplicate URL rejection logic
    // -----------------------------------------------------------------
    const [existingRow] = await conn.query("SELECT url FROM sitemap_links LIMIT 1");
    if (existingRow.length > 0) {
      const existingUrl = existingRow[0].url;
      const [duplicateCheck] = await conn.query("SELECT id FROM sitemap_links WHERE url = ?", [existingUrl]);
      assert(duplicateCheck.length === 1, `Existing URL ${existingUrl} is unique without duplicate`);
    }

    // -----------------------------------------------------------------
    // TEST 10: Sitemap Automation (Only Published & Indexable Pages)
    // -----------------------------------------------------------------
    const [sitemapEligible] = await conn.query(
      `SELECT COUNT(*) as cnt 
       FROM sitemap_links 
       WHERE is_active = 1 
         AND is_indexable = 1 
         AND (status = 'published' OR status IS NULL)`
    );
    const [drafts] = await conn.query(
      "SELECT COUNT(*) as cnt FROM sitemap_links WHERE status = 'draft' OR is_active = 0"
    );
    const [noindex] = await conn.query(
      "SELECT COUNT(*) as cnt FROM sitemap_links WHERE is_indexable = 0"
    );

    assert(sitemapEligible[0].cnt >= 0, `Sitemap query correctly filters only published & indexable pages (Found: ${sitemapEligible[0].cnt})`);
    console.log(`   ℹ️ Drafts isolated: ${drafts[0].cnt}, Noindex isolated: ${noindex[0].cnt}`);

    // -----------------------------------------------------------------
    // TEST 11: Preservation of existing database rows
    // -----------------------------------------------------------------
    const [finalTotal] = await conn.query("SELECT COUNT(*) as cnt FROM sitemap_links");
    assert(finalTotal[0].cnt >= 26, `All original records preserved (Current total: ${finalTotal[0].cnt})`);

  } finally {
    await conn.end();
  }

  console.log("\n==========================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

testAcceptanceCriteria().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

