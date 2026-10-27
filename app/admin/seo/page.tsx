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
         id, title, url, slug, page_type, parent_id, group_name, city, area, category_id, service_id, zone_id,
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

  // 5. Fetch parent locations for hierarchy selector
  let parentLocations: any[] = [];
  try {
    const [parentRows]: any = await pool.query(
      `SELECT id, title, slug, url, page_type 
       FROM sitemap_links 
       WHERE page_type = 'location' OR (parent_id IS NULL AND url LIKE '/%')
       ORDER BY title ASC`
    );
    parentLocations = parentRows || [];
  } catch (e) {
    console.error("Error loading parent locations:", e);
  }

  // 6. Fetch unified locations
  const locations = await getUnifiedLocations();

  // 7. Fetch active service zones
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
    />
  );
}
