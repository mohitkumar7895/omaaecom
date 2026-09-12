import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Fetch all sitemap links with statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const search = searchParams.get("search");

    let query = "SELECT * FROM sitemap_links WHERE 1=1";
    const params: any[] = [];

    if (group && group !== "All") {
      query += " AND group_name = ?";
      params.push(group);
    }

    if (search && search.trim() !== "") {
      query += " AND (title LIKE ? OR url LIKE ? OR city LIKE ? OR area LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += " ORDER BY is_active DESC, priority DESC, id ASC";

    const [rows]: any = await pool.query(query, params);

    // Fetch stats
    const [statsRows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN group_name = 'Area-wise SEO' THEN 1 ELSE 0 END) as area_count,
        SUM(CASE WHEN group_name = 'Services' THEN 1 ELSE 0 END) as services_count,
        SUM(CASE WHEN group_name = 'Main Pages' THEN 1 ELSE 0 END) as main_count
      FROM sitemap_links
    `);

    const stats = statsRows[0] || {
      total: 0,
      active_count: 0,
      area_count: 0,
      services_count: 0,
      main_count: 0,
    };

    return NextResponse.json({
      success: true,
      links: rows,
      stats: {
        total: Number(stats.total) || 0,
        active: Number(stats.active_count) || 0,
        areaWise: Number(stats.area_count) || 0,
        services: Number(stats.services_count) || 0,
        mainPages: Number(stats.main_count) || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching sitemap links:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sitemap links" },
      { status: 500 }
    );
  }
}

// POST: Add a single custom link OR bulk-generate Area-wise SEO links
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. BULK AREA-WISE GENERATION
    if (body.is_bulk_area) {
      const { category_id, city, areas, priority = 0.8, changefreq = "weekly" } = body;

      if (!city || !areas || !Array.isArray(areas) || areas.length === 0) {
        return NextResponse.json(
          { success: false, error: "City and a list of areas are required." },
          { status: 400 }
        );
      }

      let categoryTitle = "";
      if (category_id) {
        const [cats]: any = await pool.query("SELECT title FROM categories WHERE id = ?", [category_id]);
        if (cats.length > 0) {
          categoryTitle = cats[0].title;
        }
      }

      const inserted: string[] = [];
      const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      for (const rawArea of areas) {
        const areaName = rawArea.trim();
        if (!areaName) continue;

        const areaSlug = areaName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        
        let linkTitle = "";
        let linkUrl = "";

        if (categoryTitle && category_id) {
          linkTitle = `${categoryTitle} in ${areaName}, ${city}`;
          linkUrl = `/services/${category_id}?city=${encodeURIComponent(citySlug)}&area=${encodeURIComponent(areaSlug)}`;
        } else {
          linkTitle = `Appliance Repair & Maintenance in ${areaName}, ${city}`;
          linkUrl = `/${citySlug}?area=${encodeURIComponent(areaSlug)}`;
        }

        await pool.query(
          `INSERT INTO sitemap_links (title, url, group_name, city, area, category_id, priority, changefreq, is_active, is_system)
           VALUES (?, ?, 'Area-wise SEO', ?, ?, ?, ?, ?, TRUE, FALSE)
           ON DUPLICATE KEY UPDATE title = VALUES(title), city = VALUES(city), area = VALUES(area), priority = VALUES(priority)`,
          [linkTitle, linkUrl, city, areaName, category_id || null, priority, changefreq]
        );
        inserted.push(linkUrl);
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${inserted.length} Area-wise SEO links successfully!`,
        count: inserted.length,
      });
    }

    // 2. SINGLE LINK CREATION
    let { 
      title, 
      url, 
      group_name = "Custom", 
      city, 
      area, 
      priority = 0.8, 
      changefreq = "weekly", 
      is_active = true,
      heading,
      subheading,
      content,
      meta_description,
      features
    } = body;

    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: "Title and URL are required." },
        { status: 400 }
      );
    }

    // Clean URL
    url = url.trim();
    if (!url.startsWith("/") && !url.startsWith("http")) {
      url = "/" + url;
    }

    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : (features ? JSON.stringify(features) : null);

    await pool.query(
      `INSERT INTO sitemap_links (title, url, group_name, city, area, priority, changefreq, is_active, is_system, heading, subheading, content, meta_description, features)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         title = VALUES(title), 
         group_name = VALUES(group_name), 
         city = VALUES(city), 
         area = VALUES(area), 
         priority = VALUES(priority), 
         changefreq = VALUES(changefreq), 
         is_active = VALUES(is_active),
         heading = VALUES(heading),
         subheading = VALUES(subheading),
         content = VALUES(content),
         meta_description = VALUES(meta_description),
         features = VALUES(features)`,
      [title.trim(), url, group_name, city || null, area || null, priority, changefreq, is_active, heading || null, subheading || null, content || null, meta_description || null, featuresJson]
    );

    return NextResponse.json({
      success: true,
      message: "Sitemap link and content details saved successfully!",
    });
  } catch (error: any) {
    console.error("Error creating sitemap link:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create sitemap link" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing link (or toggle active status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      title, 
      url, 
      group_name, 
      city, 
      area, 
      priority, 
      changefreq, 
      is_active,
      heading,
      subheading,
      content,
      meta_description,
      features
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Link ID is required." }, { status: 400 });
    }

    // If only toggling active status
    if (is_active !== undefined && title === undefined && url === undefined) {
      await pool.query("UPDATE sitemap_links SET is_active = ? WHERE id = ?", [Boolean(is_active), id]);
      return NextResponse.json({ success: true, message: `Status updated to ${is_active ? "Active" : "Inactive"}` });
    }

    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : (features ? JSON.stringify(features) : null);

    // Full edit
    await pool.query(
      `UPDATE sitemap_links 
       SET title = COALESCE(?, title),
           url = COALESCE(?, url),
           group_name = COALESCE(?, group_name),
           city = COALESCE(?, city),
           area = COALESCE(?, area),
           priority = COALESCE(?, priority),
           changefreq = COALESCE(?, changefreq),
           is_active = COALESCE(?, is_active),
           heading = ?,
           subheading = ?,
           content = ?,
           meta_description = ?,
           features = ?
       WHERE id = ?`,
      [title, url, group_name, city, area, priority, changefreq, is_active, heading || null, subheading || null, content || null, meta_description || null, featuresJson, id]
    );

    return NextResponse.json({ success: true, message: "Link and page content updated successfully!" });
  } catch (error: any) {
    console.error("Error updating sitemap link:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a link or bulk delete
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, ids } = body;

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await pool.query("DELETE FROM sitemap_links WHERE id IN (?)", [ids]);
      return NextResponse.json({ success: true, message: `Deleted ${ids.length} links successfully!` });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Link ID or array of IDs is required." }, { status: 400 });
    }

    await pool.query("DELETE FROM sitemap_links WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Link deleted successfully!" });
  } catch (error: any) {
    console.error("Error deleting sitemap link:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete link" },
      { status: 500 }
    );
  }
}
