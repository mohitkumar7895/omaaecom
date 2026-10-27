import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUnifiedLocations } from "@/lib/seo-locations-provider";

export const dynamic = "force-dynamic";

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^sitemap\//, "")
    .replace(/[^a-z0-9\-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET: List SEO pages with filtering, stats, and metadata
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const indexable = searchParams.get("indexable") || "all";
    const categoryId = searchParams.get("category_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search.trim()) {
      whereClause += " AND (title LIKE ? OR url LIKE ? OR slug LIKE ? OR city LIKE ? OR area LIKE ? OR h1 LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term);
    }

    if (status === "published") {
      whereClause += " AND status = 'published' AND is_active = 1";
    } else if (status === "draft") {
      whereClause += " AND (status = 'draft' OR is_active = 0)";
    }

    if (indexable === "yes") {
      whereClause += " AND is_indexable = 1";
    } else if (indexable === "no") {
      whereClause += " AND (is_indexable = 0 OR is_indexable IS NULL)";
    }

    if (categoryId && categoryId !== "all") {
      whereClause += " AND category_id = ?";
      params.push(parseInt(categoryId, 10));
    }

    // Total count for current filter
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM sitemap_links ${whereClause}`,
      params
    );
    const totalFiltered = Number(countRows[0]?.total || 0);

    // Fetch paginated pages
    const [rows]: any = await pool.query(
      `SELECT 
         id, title, url, slug, group_name, city, area, category_id, service_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url, featured_image, created_at, updated_at
       FROM sitemap_links
       ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Formatted rows
    const pages = rows.map((r: any) => ({
      ...r,
      slug: r.slug || sanitizeSlug(r.url),
      faqs: typeof r.faqs === "string" ? JSON.parse(r.faqs) : r.faqs || [],
      status: r.status || (r.is_active ? "published" : "draft"),
    }));

    // Overall aggregate stats
    const [statsRows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' AND is_active = 1 THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN status = 'draft' OR is_active = 0 THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN is_indexable = 1 THEN 1 ELSE 0 END) as indexable_count,
        SUM(CASE WHEN is_indexable = 0 OR is_indexable IS NULL THEN 1 ELSE 0 END) as noindex_count
      FROM sitemap_links
    `);

    // Fetch categories and services for admin dropdowns
    const [categories]: any = await pool.query(
      "SELECT id, title FROM categories WHERE status = 'Active' ORDER BY id ASC"
    );

    const [services]: any = await pool.query(
      "SELECT id, category_id, title FROM services ORDER BY title ASC"
    );

    // Fetch unified locations (zones + categories.zones_location)
    const locations = await getUnifiedLocations();

    return NextResponse.json({
      success: true,
      pages,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit),
      },
      stats: {
        total: Number(statsRows[0]?.total || 0),
        published: Number(statsRows[0]?.published_count || 0),
        draft: Number(statsRows[0]?.draft_count || 0),
        indexable: Number(statsRows[0]?.indexable_count || 0),
        noindex: Number(statsRows[0]?.noindex_count || 0),
      },
      categories: categories || [],
      services: services || [],
      locations,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/seo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch SEO pages" },
      { status: 500 }
    );
  }
}

// POST: Create a single dynamic SEO page OR bulk generate Service + Location combinations
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Bulk generation by Service + Locations
    if (body.is_bulk_generation) {
      const { category_id, service_id, locations, status = "published", is_indexable = false } = body;

      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return NextResponse.json(
          { success: false, error: "Please select at least one Location." },
          { status: 400 }
        );
      }

      let serviceTitle = "Home Appliance Repair";
      let catId = category_id ? Number(category_id) : null;

      if (service_id) {
        const [svcs]: any = await pool.query("SELECT id, category_id, title FROM services WHERE id = ?", [service_id]);
        if (svcs.length > 0) {
          serviceTitle = svcs[0].title;
          catId = svcs[0].category_id;
        }
      } else if (category_id) {
        const [cats]: any = await pool.query("SELECT id, title FROM categories WHERE id = ?", [category_id]);
        if (cats.length > 0) {
          serviceTitle = cats[0].title;
        }
      }

      const insertedSlugs: string[] = [];

      for (const loc of locations) {
        const locName = typeof loc === "string" ? loc.trim() : (loc.name || loc.area || loc.city || "").trim();
        const cityName = typeof loc === "object" ? loc.city || "Delhi NCR" : "Delhi NCR";
        if (!locName) continue;

        // Auto-generate slug
        const rawSlug = `${serviceTitle} in ${locName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slug = sanitizeSlug(rawSlug);
        const url = `/${slug}`;

        const pageTitle = `${serviceTitle} in ${locName}, ${cityName}`;
        const h1 = `${serviceTitle} in ${locName}`;
        const metaDesc = `Doorstep ${serviceTitle.toLowerCase()} in ${locName}, ${cityName}. Certified local technicians, same-day service, genuine spare parts & 30-day warranty. Call 9999251966.`;

        const defaultFaqs = [
          {
            question: `How fast can a technician reach ${locName}?`,
            answer: `Most doorstep visits in ${locName} are scheduled within 60 to 90 minutes. Call 9999251966 for immediate booking.`,
          },
          {
            question: `Is there a warranty on ${serviceTitle} in ${locName}?`,
            answer: `Yes, all completed repairs include an official 30-day service warranty with genuine spare parts.`,
          },
        ];

        await pool.query(
          `INSERT INTO sitemap_links (
             title, url, slug, group_name, city, area, category_id, service_id,
             priority, changefreq, is_active, is_indexable, is_system,
             status, h1, h2, meta_title, meta_description, subheading,
             faqs, canonical_url
           ) VALUES (?, ?, ?, 'Area-wise SEO', ?, ?, ?, ?, 0.85, 'weekly', ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             title = VALUES(title),
             slug = VALUES(slug),
             city = VALUES(city),
             area = VALUES(area),
             category_id = VALUES(category_id),
             service_id = VALUES(service_id),
             is_active = VALUES(is_active),
             is_indexable = VALUES(is_indexable),
             status = VALUES(status),
             h1 = VALUES(h1),
             meta_title = VALUES(meta_title),
             meta_description = VALUES(meta_description)`,
          [
            pageTitle,
            url,
            slug,
            cityName,
            locName,
            catId,
            service_id || null,
            status === "published" ? 1 : 0,
            Boolean(is_indexable) ? 1 : 0,
            status,
            h1,
            `Trusted ${serviceTitle} Experts in ${locName}`,
            pageTitle,
            metaDesc,
            metaDesc,
            JSON.stringify(defaultFaqs),
            url,
          ]
        );
        insertedSlugs.push(slug);
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${insertedSlugs.length} Dynamic SEO pages successfully!`,
        count: insertedSlugs.length,
      });
    }

    // 2. Single SEO page creation
    const {
      title,
      slug: rawSlug,
      h1,
      h2,
      h3,
      meta_title,
      meta_description,
      subheading,
      content,
      city,
      area,
      category_id,
      service_id,
      zone_id,
      priority = 0.8,
      changefreq = "weekly",
      status = "published",
      is_indexable = false,
      faqs = [],
      canonical_url,
      featured_image,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Page Title is required." }, { status: 400 });
    }

    // Determine slug
    let slug = sanitizeSlug(rawSlug || title);
    if (!slug) {
      slug = sanitizeSlug(title);
    }

    // Check slug uniqueness
    const [existing]: any = await pool.query(
      "SELECT id FROM sitemap_links WHERE slug = ? OR url = ? OR url = ?",
      [slug, `/${slug}`, `/sitemap/${slug}`]
    );

    if (existing && existing.length > 0) {
      // Append unique suffix
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const url = `/${slug}`;
    const isActive = status === "published" ? 1 : 0;
    const faqsJson = Array.isArray(faqs) ? JSON.stringify(faqs) : null;
    const finalCanonical = canonical_url && canonical_url.trim() ? canonical_url.trim() : url;

    await pool.query(
      `INSERT INTO sitemap_links (
         title, url, slug, group_name, city, area, category_id, service_id, zone_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url, featured_image
       ) VALUES (?, ?, ?, 'Area-wise SEO', ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        url,
        slug,
        city || null,
        area || null,
        category_id ? Number(category_id) : null,
        service_id ? Number(service_id) : null,
        zone_id ? Number(zone_id) : null,
        Number(priority) || 0.8,
        changefreq || "weekly",
        isActive,
        Boolean(is_indexable) ? 1 : 0,
        status,
        h1 || title.trim(),
        h2 || null,
        h3 || null,
        meta_title || title.trim(),
        meta_description || null,
        subheading || null,
        content || null,
        faqsJson,
        finalCanonical,
        featured_image || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Dynamic SEO page created successfully!",
      slug,
      url,
    });
  } catch (error: any) {
    console.error("Error creating SEO page:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create SEO page" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing SEO page
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Page ID is required." }, { status: 400 });
    }

    // Check if page exists
    const [existing]: any = await pool.query("SELECT * FROM sitemap_links WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "SEO page not found." }, { status: 404 });
    }

    const current = existing[0];

    // Determine slug
    let slug = body.slug ? sanitizeSlug(body.slug) : current.slug;
    if (!slug) {
      slug = sanitizeSlug(body.title || current.title);
    }

    // Check if new slug conflicts with another record
    if (slug !== current.slug) {
      const [conflict]: any = await pool.query(
        "SELECT id FROM sitemap_links WHERE (slug = ? OR url = ?) AND id != ?",
        [slug, `/${slug}`, id]
      );
      if (conflict && conflict.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const url = `/${slug}`;
    const status = body.status !== undefined ? body.status : (current.status || "published");
    const isActive = body.is_active !== undefined ? (body.is_active ? 1 : 0) : (status === "published" ? 1 : 0);
    const isIndexable = body.is_indexable !== undefined ? (body.is_indexable ? 1 : 0) : current.is_indexable;
    const faqsJson = body.faqs !== undefined ? (Array.isArray(body.faqs) ? JSON.stringify(body.faqs) : null) : current.faqs;
    const canonical = body.canonical_url !== undefined ? body.canonical_url : (current.canonical_url || url);

    await pool.query(
      `UPDATE sitemap_links SET
         title = ?,
         url = ?,
         slug = ?,
         group_name = ?,
         city = ?,
         area = ?,
         category_id = ?,
         service_id = ?,
         zone_id = ?,
         priority = ?,
         changefreq = ?,
         is_active = ?,
         is_indexable = ?,
         status = ?,
         h1 = ?,
         h2 = ?,
         h3 = ?,
         meta_title = ?,
         meta_description = ?,
         subheading = ?,
         content = ?,
         faqs = ?,
         canonical_url = ?,
         featured_image = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        body.title !== undefined ? body.title : current.title,
        url,
        slug,
        body.group_name !== undefined ? body.group_name : current.group_name,
        body.city !== undefined ? body.city : current.city,
        body.area !== undefined ? body.area : current.area,
        body.category_id !== undefined ? (body.category_id ? Number(body.category_id) : null) : current.category_id,
        body.service_id !== undefined ? (body.service_id ? Number(body.service_id) : null) : current.service_id,
        body.zone_id !== undefined ? (body.zone_id ? Number(body.zone_id) : null) : current.zone_id,
        body.priority !== undefined ? Number(body.priority) : current.priority,
        body.changefreq !== undefined ? body.changefreq : current.changefreq,
        isActive,
        isIndexable,
        status,
        body.h1 !== undefined ? body.h1 : current.h1,
        body.h2 !== undefined ? body.h2 : current.h2,
        body.h3 !== undefined ? body.h3 : current.h3,
        body.meta_title !== undefined ? body.meta_title : current.meta_title,
        body.meta_description !== undefined ? body.meta_description : current.meta_description,
        body.subheading !== undefined ? body.subheading : current.subheading,
        body.content !== undefined ? body.content : current.content,
        faqsJson,
        canonical,
        body.featured_image !== undefined ? body.featured_image : current.featured_image,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "SEO page updated successfully!",
      slug,
      url,
    });
  } catch (error: any) {
    console.error("Error updating SEO page:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update SEO page" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an SEO page
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Page ID is required." }, { status: 400 });
    }

    // Protect core system pages
    const [row]: any = await pool.query("SELECT is_system, title FROM sitemap_links WHERE id = ?", [id]);
    if (!row || row.length === 0) {
      return NextResponse.json({ success: false, error: "Page not found." }, { status: 404 });
    }

    if (row[0].is_system) {
      return NextResponse.json(
        { success: false, error: "System pages cannot be deleted." },
        { status: 403 }
      );
    }

    await pool.query("DELETE FROM sitemap_links WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: `Page "${row[0].title}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting SEO page:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete SEO page" },
      { status: 500 }
    );
  }
}
