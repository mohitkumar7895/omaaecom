import { NextResponse } from "next/server";
import pool from "@/lib/db";

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
      { title: "Sitemap Directory", url: "/sitemap", group_name: "Main Pages", priority: 0.6, changefreq: "weekly" },
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
