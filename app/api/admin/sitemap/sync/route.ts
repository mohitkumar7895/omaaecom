import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { SEO_LOCATIONS } from "@/lib/seo-locations";
import { SEO_SERVICES } from "@/lib/seo-services";
import { SEO_KEYWORD_PAGES, keywordFitsLocation } from "@/lib/seo-keywords";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    let insertedOrUpdated = 0;

    // 1. Static / System pages
    const staticPages = [
      { title: "Home - Doorstep Appliance Repair & Maintenance", url: "/", group_name: "Main Pages", priority: 1.0, changefreq: "daily" },
      { title: "About Us - OMAA Company", url: "/about", group_name: "Main Pages", priority: 0.8, changefreq: "monthly" },
      { title: "Contact Us & Support", url: "/contact", group_name: "Main Pages", priority: 0.8, changefreq: "monthly" },
      { title: "Rate Card - Transparent Service Pricing", url: "/rate-card", group_name: "Main Pages", priority: 0.8, changefreq: "weekly" },
      { title: "Lodge Complaint & Grievance", url: "/complaint", group_name: "Main Pages", priority: 0.7, changefreq: "monthly" },
      { title: "Professional Service Partner Registration", url: "/registration_form.php", group_name: "Main Pages", priority: 0.7, changefreq: "monthly" },
      { title: "Privacy Policy", url: "/privacy-policy", group_name: "Legal & Policies", priority: 0.5, changefreq: "yearly" },
      { title: "Terms & Conditions", url: "/terms-and-conditions", group_name: "Legal & Policies", priority: 0.5, changefreq: "yearly" },
    ];

    for (const p of staticPages) {
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, priority, changefreq, is_active, is_system)
         VALUES (?, ?, ?, ?, ?, TRUE, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), priority = VALUES(priority)`,
        [p.title, p.url, p.group_name, p.priority, p.changefreq]
      );
      insertedOrUpdated++;
    }

    await pool.query(
      `UPDATE sitemap_links SET is_active = FALSE
       WHERE url IN ('/sitemap', '/sitemap-directory', '/sitemap-pages')`
    );

    // 2. Active Categories
    const [categories]: any = await pool.query("SELECT id, title FROM categories WHERE status = 'Active'");
    for (const cat of categories) {
      const url = `/services/${cat.id}`;
      const title = `${cat.title} - Doorstep Repair & Services`;
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, category_id, priority, changefreq, is_active, is_system)
         VALUES (?, ?, 'Services', ?, 0.9, 'weekly', TRUE, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), category_id = VALUES(category_id)`,
        [title, url, cat.id]
      );
      insertedOrUpdated++;
    }

    // 3. Society + city SEO pages (and RO / fridge / washing machine URLs)
    for (const loc of SEO_LOCATIONS) {
      const locUrl = `/${loc.slug}`;
      const locTitle = `RO, Refrigerator & Washing Machine Repair in ${loc.title}`;
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system)
         VALUES (?, ?, 'Area-wise SEO', ?, ?, ?, 'weekly', TRUE, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), is_active = TRUE, city = VALUES(city), area = VALUES(area), priority = VALUES(priority)`,
        [locTitle, locUrl, loc.region, loc.title, loc.kind === "society" ? 0.9 : 0.8]
      );
      insertedOrUpdated++;

      for (const svc of SEO_SERVICES) {
        const svcUrl = `/${loc.slug}/${svc.slug}`;
        const svcTitle = `${svc.titleKeyword} in ${loc.title}`;
        await pool.query(
          `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system)
           VALUES (?, ?, 'Area-wise SEO', ?, ?, 0.85, 'weekly', TRUE, TRUE)
           ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), is_active = TRUE, city = VALUES(city), area = VALUES(area)`,
          [svcTitle, svcUrl, loc.region, loc.title]
        );
        insertedOrUpdated++;
      }

      for (const kw of SEO_KEYWORD_PAGES) {
        if (!keywordFitsLocation(kw, loc.slug)) continue;
        const kwUrl = `/${loc.slug}/${kw.slug}`;
        const kwTitle = `${kw.title} in ${loc.title}`;
        await pool.query(
          `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system)
           VALUES (?, ?, 'Area-wise SEO', ?, ?, 0.8, 'weekly', TRUE, TRUE)
           ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), is_active = TRUE, city = VALUES(city), area = VALUES(area)`,
          [kwTitle, kwUrl, loc.region, loc.title]
        );
        insertedOrUpdated++;
      }
    }

    for (const kw of SEO_KEYWORD_PAGES) {
      const url = `/${kw.slug}`;
      await pool.query(
        `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system)
         VALUES (?, ?, 'Keyword SEO', 'Noida', ?, 0.95, 'weekly', TRUE, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title), group_name = VALUES(group_name), is_active = TRUE, priority = VALUES(priority)`,
        [kw.title, url, kw.title]
      );
      insertedOrUpdated++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${insertedOrUpdated} system pages and categories.`,
    });
  } catch (error: any) {
    console.error("Error syncing sitemap:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync sitemap" },
      { status: 500 }
    );
  }
}
