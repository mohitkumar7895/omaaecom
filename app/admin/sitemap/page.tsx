import pool from "@/lib/db";
import SitemapManager from "@/app/admin/sitemap/SitemapManager";

export const dynamic = "force-dynamic";

export default async function AdminSitemapPage() {
  let categories: any[] = [];
  let links: any[] = [];
  let stats = {
    total: 0,
    active: 0,
    areaWise: 0,
    services: 0,
    mainPages: 0,
  };

  try {
    const [catRows]: any = await pool.query(
      "SELECT id, title FROM categories WHERE status = 'Active' ORDER BY id ASC"
    );
    categories = catRows || [];

    const [linkRows]: any = await pool.query(
      "SELECT * FROM sitemap_links ORDER BY is_active DESC, priority DESC, id ASC"
    );
    links = linkRows || [];

    const [statsRows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN group_name = 'Area-wise SEO' THEN 1 ELSE 0 END) as area_count,
        SUM(CASE WHEN group_name = 'Services' THEN 1 ELSE 0 END) as services_count,
        SUM(CASE WHEN group_name = 'Main Pages' THEN 1 ELSE 0 END) as main_count
      FROM sitemap_links
    `);

    if (statsRows && statsRows.length > 0) {
      stats = {
        total: Number(statsRows[0].total) || 0,
        active: Number(statsRows[0].active_count) || 0,
        areaWise: Number(statsRows[0].area_count) || 0,
        services: Number(statsRows[0].services_count) || 0,
        mainPages: Number(statsRows[0].main_count) || 0,
      };
    }
  } catch (error) {
    console.error("Error loading sitemap admin page:", error);
  }

  return (
    <SitemapManager
      categories={categories}
      initialLinks={links}
      initialStats={stats}
    />
  );
}
