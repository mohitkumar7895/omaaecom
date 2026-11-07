import pool from "@/lib/db";
import SeoManager from "./SeoManager";
import { getUnifiedLocations } from "@/lib/seo-locations-provider";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  let initialPages: any[] = [];
  let categories: any[] = [];
  let services: any[] = [];
  let stats = {
    total: 0,
    published: 0,
    draft: 0,
    indexable: 0,
    noindex: 0,
  };

  try {
    // 1. Fetch categories
    const [catRows]: any = await pool.query(
      "SELECT id, title FROM categories WHERE status = 'Active' ORDER BY id ASC"
    );
    categories = catRows || [];

    // 2. Fetch services
    const [svcRows]: any = await pool.query(
      "SELECT id, category_id, title FROM services ORDER BY title ASC"
    );
    services = svcRows || [];

    // 3. Fetch initial 50 SEO pages
    const [pageRows]: any = await pool.query(
      `SELECT 
         id, title, url, slug, page_type, parent_id, parent_location_id, child_avenue_id, child_society_id,
         group_name, city, area, category_id, service_id, zone_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url, featured_image, updated_at
       FROM sitemap_links
       ORDER BY updated_at DESC, id DESC
       LIMIT 50`
    );

    initialPages = (pageRows || []).map((r: any) => ({
      ...r,
      faqs: typeof r.faqs === "string" ? JSON.parse(r.faqs) : r.faqs || [],
      status: r.status || (r.is_active ? "published" : "draft"),
      page_type: r.page_type || "service",
      parent_id: r.parent_id || null,
      parent_location_id: r.parent_location_id || null,
      child_avenue_id: r.child_avenue_id || null,
      child_society_id: r.child_society_id || null,
    }));

    // 4. Fetch stats
    const [statsRows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' AND is_active = 1 THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN status = 'draft' OR is_active = 0 THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN is_indexable = 1 THEN 1 ELSE 0 END) as indexable_count,
        SUM(CASE WHEN is_indexable = 0 OR is_indexable IS NULL THEN 1 ELSE 0 END) as noindex_count
      FROM sitemap_links
    `);

    if (statsRows && statsRows.length > 0) {
      stats = {
        total: Number(statsRows[0]?.total || 0),
        published: Number(statsRows[0]?.published_count || 0),
        draft: Number(statsRows[0]?.draft_count || 0),
        indexable: Number(statsRows[0]?.indexable_count || 0),
        noindex: Number(statsRows[0]?.noindex_count || 0),
      };
    }
  } catch (error) {
    console.error("Error loading Admin SEO page:", error);
  }

  // 5. Fetch Parent Locations from parent_locations table
  let parentLocations: any[] = [];
  try {
    const [parentRows]: any = await pool.query(
      `SELECT 
         pl.id, 
         pl.name, 
         pl.name as title, 
         pl.slug, 
         CONCAT('/', pl.slug) as url, 
         'location' as page_type,
         pl.zone_id, 
         sz.name as zone_name,
         pl.city, 
         pl.description, 
         pl.status,
         (SELECT COUNT(*) FROM child_avenues ca WHERE ca.parent_location_id = pl.id) as avenues_count,
         (SELECT COUNT(*) FROM child_societies cs WHERE cs.parent_location_id = pl.id) as societies_count,
         (SELECT COUNT(*) FROM sitemap_links sl WHERE sl.parent_location_id = pl.id OR sl.parent_id = pl.id) as pages_count
       FROM parent_locations pl
       LEFT JOIN service_zones sz ON pl.zone_id = sz.id
       ORDER BY pl.name ASC`
    );
    parentLocations = parentRows || [];
  } catch (e) {
    console.error("Error loading parent locations from table, falling back:", e);
    try {
      const [fallback]: any = await pool.query(
        `SELECT id, title as name, title, slug, url, 'location' as page_type 
         FROM sitemap_links 
         WHERE page_type = 'location' OR (parent_id IS NULL AND url LIKE '/%')
         ORDER BY title ASC`
      );
      parentLocations = fallback || [];
    } catch {}
  }

  // 6. Fetch Child Avenues
  let childAvenues: any[] = [];
  try {
    const [avenueRows]: any = await pool.query(
      `SELECT 
         ca.id, 
         ca.parent_location_id, 
         ca.name, 
         ca.slug, 
         ca.description, 
         ca.status,
         pl.name as parent_name,
         pl.slug as parent_slug,
         pl.city,
         (SELECT COUNT(*) FROM sitemap_links sl WHERE sl.child_avenue_id = ca.id) as pages_count
       FROM child_avenues ca
       JOIN parent_locations pl ON ca.parent_location_id = pl.id
       ORDER BY pl.name ASC, ca.name ASC`
    );
    childAvenues = avenueRows || [];
  } catch (e) {
    console.error("Error loading child avenues:", e);
  }

  // 7. Fetch Child Societies
  let childSocieties: any[] = [];
  try {
    const [societyRows]: any = await pool.query(
      `SELECT 
         cs.id, 
         cs.parent_location_id, 
         cs.child_avenue_id,
         cs.name, 
         cs.slug, 
         cs.description, 
         cs.status,
         pl.name as parent_name,
         pl.slug as parent_slug,
         pl.city,
         ca.name as avenue_name,
         (SELECT COUNT(*) FROM sitemap_links sl WHERE sl.child_society_id = cs.id) as pages_count
       FROM child_societies cs
       JOIN parent_locations pl ON cs.parent_location_id = pl.id
       LEFT JOIN child_avenues ca ON cs.child_avenue_id = ca.id
       ORDER BY pl.name ASC, cs.name ASC`
    );
    childSocieties = societyRows || [];
  } catch (e) {
    console.error("Error loading child societies:", e);
  }

  // 8. Fetch unified locations
  const locations = await getUnifiedLocations();

  // 9. Fetch active service zones
  let zones: any[] = [];
  try {
    const [zoneRows]: any = await pool.query(
      "SELECT id, name, city_names FROM service_zones WHERE status = 'Active' ORDER BY name ASC"
    );
    zones = zoneRows || [];
  } catch (e) {
    console.error("Error loading service zones:", e);
  }

  return (
    <SeoManager
      initialPages={initialPages}
      initialStats={stats}
      categories={categories}
      services={services}
      locations={locations}
      zones={zones}
      parentLocations={parentLocations}
      initialChildAvenues={childAvenues}
      initialChildSocieties={childSocieties}
    />
  );
}
