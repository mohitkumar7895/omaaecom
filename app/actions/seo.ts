"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

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

export interface SeoFilterParams {
  search?: string;
  status?: string;
  indexable?: string;
  category_id?: string;
  zone_id?: string;
  page_type?: string;
  parent_id?: string;
  parent_location_id?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// 1. PARENT LOCATION ACTIONS
// ==========================================

export async function getParentLocations() {
  try {
    const [rows]: any = await pool.query(
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

    return { success: true, parents: rows || [] };
  } catch (err: any) {
    console.error("Error fetching parent locations:", err);
    // Fallback to sitemap_links if table error
    try {
      const [fallback]: any = await pool.query(
        `SELECT id, title as name, title, slug, url, 'location' as page_type, city, status
         FROM sitemap_links 
         WHERE page_type = 'location' OR (parent_id IS NULL AND url LIKE '/%')
         ORDER BY title ASC`
      );
      return { success: true, parents: fallback || [] };
    } catch {
      return { success: false, parents: [] };
    }
  }
}

export async function saveParentLocation(data: {
  id?: number;
  name: string;
  slug?: string;
  zone_id?: number | null;
  city: string;
  description?: string;
  status?: "Active" | "Inactive";
}) {
  try {
    const name = data.name.trim();
    if (!name) return { success: false, error: "Parent Location Name is required" };

    const rawSlug = data.slug?.trim() || name;
    const slug = sanitizeSlug(rawSlug);
    const city = data.city?.trim() || "Greater Noida West";
    const zoneId = data.zone_id ? Number(data.zone_id) : null;
    const description = data.description?.trim() || null;
    const status = data.status || "Active";

    if (data.id) {
      // Check slug uniqueness
      const [existing]: any = await pool.query(
        "SELECT id FROM parent_locations WHERE slug = ? AND id != ?",
        [slug, data.id]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Slug "${slug}" is already in use by another parent location.` };
      }

      await pool.query(
        `UPDATE parent_locations 
         SET name = ?, slug = ?, zone_id = ?, city = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, slug, zoneId, city, description, status, data.id]
      );

      // Also ensure parent page in sitemap_links is kept in sync
      const parentUrl = `/${slug}`;
      await pool.query(
        `UPDATE sitemap_links 
         SET title = ?, h1 = ?, meta_title = ?, city = ?, area = ?, zone_id = ?, status = ?
         WHERE parent_location_id = ? AND page_type = 'location'`,
        [name, name, `${name} | Doorstep Appliance Repair`, city, name, zoneId, status === "Active" ? "published" : "draft", data.id]
      );

      revalidatePath("/admin/seo");
      revalidatePath(parentUrl);
      return { success: true, message: `Parent Location "${name}" updated!` };
    } else {
      // Check slug uniqueness
      const [existing]: any = await pool.query(
        "SELECT id FROM parent_locations WHERE slug = ?",
        [slug]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Slug "${slug}" already exists. Please choose a unique name or slug.` };
      }

      const [ins]: any = await pool.query(
        `INSERT INTO parent_locations (name, slug, zone_id, city, description, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, slug, zoneId, city, description, status]
      );

      const parentId = ins.insertId;

      // Automatically create a base SEO landing page for this parent location in sitemap_links
      const parentUrl = `/${slug}`;
      const pageTitle = `Doorstep Appliance Repair in ${name}, ${city}`;
      const metaDesc = `Fast, reliable doorstep RO purifier, AC, refrigerator & washing machine repair across ${name}, ${city}. Certified local technicians, same-day service, 45-day repair warranty & 90-day parts warranty. Call 9999251966.`;

      const defaultFaqs = [
        {
          question: `How fast can a technician reach ${name}?`,
          answer: `Most service visits in ${name} are attended within 60 to 90 minutes. Call 9999251966 for same-day booking.`,
        },
        {
          question: `Is there a warranty on repairs in ${name}?`,
          answer: `Yes, all completed repairs by OMAA Company include an official 45-day repair & service warranty and a 90-day warranty on genuine spare parts.`,
        },
      ];

      await pool.query(
        `INSERT INTO sitemap_links (
           title, url, slug, page_type, parent_id, parent_location_id, group_name, city, area, zone_id,
           priority, changefreq, is_active, is_indexable, is_system,
           status, h1, h2, h3, meta_title, meta_description, subheading,
           content, faqs, canonical_url
         ) VALUES (
           ?, ?, ?, 'location', NULL, ?, 'Parent Location', ?, ?, ?,
           0.95, 'weekly', 1, 1, FALSE,
           'published', ?, 'Why Choose OMAA Experts?', 'Genuine Spare Parts & Certified Technicians', ?, ?, ?,
           ?, ?, ?
         ) ON DUPLICATE KEY UPDATE 
           title = VALUES(title), parent_location_id = VALUES(parent_location_id), page_type = 'location'`,
        [
          pageTitle, parentUrl, slug, parentId, city, name, zoneId,
          pageTitle, pageTitle, metaDesc, metaDesc,
          description || metaDesc, JSON.stringify(defaultFaqs), parentUrl
        ]
      );

      revalidatePath("/admin/seo");
      revalidatePath("/sitemap.xml");
      revalidatePath(parentUrl);
      return { success: true, message: `Parent Location "${name}" created with base SEO page!` };
    }
  } catch (err: any) {
    console.error("Error saving parent location:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteParentLocation(id: number) {
  try {
    // 1. Dependency check
    const [avenues]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM child_avenues WHERE parent_location_id = ?",
      [id]
    );
    const [societies]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM child_societies WHERE parent_location_id = ?",
      [id]
    );
    const [pages]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM sitemap_links WHERE parent_location_id = ? OR parent_id = ?",
      [id, id]
    );

    const totalDeps = (avenues[0]?.cnt || 0) + (societies[0]?.cnt || 0) + (pages[0]?.cnt || 0);

    if (totalDeps > 0) {
      return {
        success: false,
        error: `Cannot delete: This Parent Location has ${avenues[0]?.cnt || 0} child avenues, ${societies[0]?.cnt || 0} child societies, and ${pages[0]?.cnt || 0} SEO pages linked to it. Please reassign or delete the children first.`,
      };
    }

    const [row]: any = await pool.query("SELECT name FROM parent_locations WHERE id = ?", [id]);
    const name = row[0]?.name || "Parent Location";

    await pool.query("DELETE FROM parent_locations WHERE id = ?", [id]);

    revalidatePath("/admin/seo");
    return { success: true, message: `Parent Location "${name}" deleted.` };
  } catch (err: any) {
    console.error("Error deleting parent location:", err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 2. CHILD AVENUE ACTIONS
// ==========================================

export async function getChildAvenues(parentLocationId?: number | string | null) {
  try {
    let query = `
      SELECT 
        ca.id, 
        ca.parent_location_id, 
        ca.name, 
        ca.slug, 
        ca.description, 
        ca.status, 
        ca.created_at,
        pl.name as parent_name,
        pl.slug as parent_slug,
        pl.city,
        (SELECT COUNT(*) FROM sitemap_links sl WHERE sl.child_avenue_id = ca.id) as pages_count
      FROM child_avenues ca
      JOIN parent_locations pl ON ca.parent_location_id = pl.id
    `;
    const params: any[] = [];

    if (parentLocationId && parentLocationId !== "all") {
      query += " WHERE ca.parent_location_id = ?";
      params.push(Number(parentLocationId));
    }

    query += " ORDER BY pl.name ASC, ca.name ASC";

    const [rows]: any = await pool.query(query, params);
    return { success: true, avenues: rows || [] };
  } catch (err: any) {
    console.error("Error fetching child avenues:", err);
    return { success: false, avenues: [] };
  }
}

export async function saveChildAvenue(data: {
  id?: number;
  parent_location_id: number;
  name: string;
  slug?: string;
  description?: string;
  status?: "Active" | "Inactive";
}) {
  try {
    const parentId = Number(data.parent_location_id);
    if (!parentId) return { success: false, error: "Parent Location is required" };

    const name = data.name.trim();
    if (!name) return { success: false, error: "Avenue Name is required" };

    const rawSlug = data.slug?.trim() || name;
    const slug = sanitizeSlug(rawSlug);
    const description = data.description?.trim() || null;
    const status = data.status || "Active";

    // Verify parent location exists
    const [parents]: any = await pool.query(
      "SELECT id, name, slug, city, zone_id FROM parent_locations WHERE id = ?",
      [parentId]
    );
    if (!parents || parents.length === 0) {
      return { success: false, error: "Selected Parent Location not found" };
    }
    const parent = parents[0];

    if (data.id) {
      // Check duplicate slug under same parent
      const [existing]: any = await pool.query(
        "SELECT id FROM child_avenues WHERE parent_location_id = ? AND slug = ? AND id != ?",
        [parentId, slug, data.id]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Avenue with slug "${slug}" already exists under ${parent.name}.` };
      }

      await pool.query(
        `UPDATE child_avenues 
         SET parent_location_id = ?, name = ?, slug = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [parentId, name, slug, description, status, data.id]
      );

      revalidatePath("/admin/seo");
      return { success: true, message: `Child Avenue "${name}" updated under ${parent.name}!` };
    } else {
      // Check duplicate slug under same parent
      const [existing]: any = await pool.query(
        "SELECT id FROM child_avenues WHERE parent_location_id = ? AND slug = ?",
        [parentId, slug]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Avenue with slug "${slug}" already exists under ${parent.name}.` };
      }

      await pool.query(
        `INSERT INTO child_avenues (parent_location_id, name, slug, description, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [parentId, name, slug, description, status]
      );

      revalidatePath("/admin/seo");
      return { success: true, message: `Child Avenue "${name}" added to ${parent.name}!` };
    }
  } catch (err: any) {
    console.error("Error saving child avenue:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteChildAvenue(id: number) {
  try {
    // Check dependency in sitemap_links
    const [pages]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM sitemap_links WHERE child_avenue_id = ?",
      [id]
    );
    if (pages[0]?.cnt > 0) {
      return {
        success: false,
        error: `Cannot delete: ${pages[0].cnt} SEO pages are linked to this Child Avenue. Please reassign or delete those pages first.`,
      };
    }

    const [row]: any = await pool.query("SELECT name FROM child_avenues WHERE id = ?", [id]);
    const name = row[0]?.name || "Child Avenue";

    await pool.query("DELETE FROM child_avenues WHERE id = ?", [id]);
    revalidatePath("/admin/seo");
    return { success: true, message: `Child Avenue "${name}" deleted.` };
  } catch (err: any) {
    console.error("Error deleting child avenue:", err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. CHILD SOCIETY ACTIONS
// ==========================================

export async function getChildSocieties(parentLocationId?: number | string | null, childAvenueId?: number | string | null) {
  try {
    let query = `
      SELECT 
        cs.id, 
        cs.parent_location_id, 
        cs.child_avenue_id,
        cs.name, 
        cs.slug, 
        cs.description, 
        cs.status, 
        cs.created_at,
        pl.name as parent_name,
        pl.slug as parent_slug,
        pl.city,
        ca.name as avenue_name,
        (SELECT COUNT(*) FROM sitemap_links sl WHERE sl.child_society_id = cs.id) as pages_count
      FROM child_societies cs
      JOIN parent_locations pl ON cs.parent_location_id = pl.id
      LEFT JOIN child_avenues ca ON cs.child_avenue_id = ca.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (parentLocationId && parentLocationId !== "all") {
      conditions.push("cs.parent_location_id = ?");
      params.push(Number(parentLocationId));
    }

    if (childAvenueId && childAvenueId !== "all") {
      conditions.push("cs.child_avenue_id = ?");
      params.push(Number(childAvenueId));
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY pl.name ASC, cs.name ASC";

    const [rows]: any = await pool.query(query, params);
    return { success: true, societies: rows || [] };
  } catch (err: any) {
    console.error("Error fetching child societies:", err);
    return { success: false, societies: [] };
  }
}

export async function saveChildSociety(data: {
  id?: number;
  parent_location_id: number;
  child_avenue_id?: number | null;
  name: string;
  slug?: string;
  description?: string;
  status?: "Active" | "Inactive";
}) {
  try {
    const parentId = Number(data.parent_location_id);
    if (!parentId) return { success: false, error: "Parent Location is required" };

    const name = data.name.trim();
    if (!name) return { success: false, error: "Society Name is required" };

    const rawSlug = data.slug?.trim() || name;
    const slug = sanitizeSlug(rawSlug);
    const avenueId = data.child_avenue_id ? Number(data.child_avenue_id) : null;
    const description = data.description?.trim() || null;
    const status = data.status || "Active";

    // Verify parent exists
    const [parents]: any = await pool.query("SELECT id, name, slug FROM parent_locations WHERE id = ?", [parentId]);
    if (!parents || parents.length === 0) {
      return { success: false, error: "Selected Parent Location not found" };
    }
    const parent = parents[0];

    if (data.id) {
      // Check duplicate slug under same parent
      const [existing]: any = await pool.query(
        "SELECT id FROM child_societies WHERE parent_location_id = ? AND slug = ? AND id != ?",
        [parentId, slug, data.id]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Society with slug "${slug}" already exists under ${parent.name}.` };
      }

      await pool.query(
        `UPDATE child_societies 
         SET parent_location_id = ?, child_avenue_id = ?, name = ?, slug = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [parentId, avenueId, name, slug, description, status, data.id]
      );

      revalidatePath("/admin/seo");
      return { success: true, message: `Child Society "${name}" updated under ${parent.name}!` };
    } else {
      // Check duplicate slug under same parent
      const [existing]: any = await pool.query(
        "SELECT id FROM child_societies WHERE parent_location_id = ? AND slug = ?",
        [parentId, slug]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Society with slug "${slug}" already exists under ${parent.name}.` };
      }

      await pool.query(
        `INSERT INTO child_societies (parent_location_id, child_avenue_id, name, slug, description, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [parentId, avenueId, name, slug, description, status]
      );

      revalidatePath("/admin/seo");
      return { success: true, message: `Child Society "${name}" added to ${parent.name}!` };
    }
  } catch (err: any) {
    console.error("Error saving child society:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteChildSociety(id: number) {
  try {
    // Check dependency in sitemap_links
    const [pages]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM sitemap_links WHERE child_society_id = ?",
      [id]
    );
    if (pages[0]?.cnt > 0) {
      return {
        success: false,
        error: `Cannot delete: ${pages[0].cnt} SEO pages are linked to this Child Society. Please reassign or delete those pages first.`,
      };
    }

    const [row]: any = await pool.query("SELECT name FROM child_societies WHERE id = ?", [id]);
    const name = row[0]?.name || "Child Society";

    await pool.query("DELETE FROM child_societies WHERE id = ?", [id]);
    revalidatePath("/admin/seo");
    return { success: true, message: `Child Society "${name}" deleted.` };
  } catch (err: any) {
    console.error("Error deleting child society:", err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. GET SEO PAGES WITH FULL HIERARCHY FILTERING
// ==========================================

export async function getSeoPages(params: SeoFilterParams = {}) {
  const {
    search = "",
    status = "all",
    indexable = "all",
    category_id,
    zone_id,
    page_type = "all",
    parent_id = "all",
    parent_location_id = "all",
    page = 1,
    limit = 50,
  } = params;
  const offset = (page - 1) * limit;

  try {
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search.trim()) {
      whereClause += " AND (title LIKE ? OR url LIKE ? OR slug LIKE ? OR city LIKE ? OR area LIKE ? OR h1 LIKE ?)";
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term, term, term, term);
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

    if (category_id && category_id !== "all") {
      whereClause += " AND category_id = ?";
      queryParams.push(parseInt(category_id, 10));
    }

    if (zone_id && zone_id !== "all") {
      whereClause += " AND zone_id = ?";
      queryParams.push(parseInt(zone_id, 10));
    }

    if (page_type && page_type !== "all") {
      whereClause += " AND page_type = ?";
      queryParams.push(page_type);
    }

    if (parent_id && parent_id !== "all") {
      whereClause += " AND (parent_id = ? OR parent_location_id = ?)";
      queryParams.push(parseInt(parent_id, 10), parseInt(parent_id, 10));
    }

    if (parent_location_id && parent_location_id !== "all") {
      whereClause += " AND parent_location_id = ?";
      queryParams.push(parseInt(parent_location_id, 10));
    }

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM sitemap_links ${whereClause}`,
      queryParams
    );
    const totalFiltered = Number(countRows[0]?.total || 0);

    const [rows]: any = await pool.query(
      `SELECT 
         id, title, url, slug, page_type, parent_id, parent_location_id, child_avenue_id, child_society_id,
         group_name, city, area, category_id, service_id, zone_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url, featured_image, created_at, updated_at
       FROM sitemap_links
       ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const pages = rows.map((r: any) => ({
      ...r,
      slug: r.slug || sanitizeSlug(r.url),
      faqs: typeof r.faqs === "string" ? JSON.parse(r.faqs) : r.faqs || [],
      status: r.status || (r.is_active ? "published" : "draft"),
      page_type: r.page_type || "service",
      parent_id: r.parent_id || null,
      parent_location_id: r.parent_location_id || null,
      child_avenue_id: r.child_avenue_id || null,
      child_society_id: r.child_society_id || null,
      zone_id: r.zone_id ? Number(r.zone_id) : null,
    }));

    const [statsRows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' AND is_active = 1 THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN status = 'draft' OR is_active = 0 THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN is_indexable = 1 THEN 1 ELSE 0 END) as indexable_count,
        SUM(CASE WHEN is_indexable = 0 OR is_indexable IS NULL THEN 1 ELSE 0 END) as noindex_count
      FROM sitemap_links
    `);

    return {
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
    };
  } catch (error: any) {
    console.error("Error in getSeoPages Server Action:", error);
    return { success: false, error: error.message || "Failed to load pages" };
  }
}

// ==========================================
// 5. SAVE / UPDATE SEO PAGE WITH 301 REDIRECTS
// ==========================================

export async function saveSeoPage(pageData: any) {
  try {
    const isEdit = Boolean(pageData.id);
    const pageType = pageData.page_type || "service";
    const parentLocationId = pageData.parent_location_id === "all" || !pageData.parent_location_id
      ? (pageData.parent_id === "all" || !pageData.parent_id ? null : Number(pageData.parent_id))
      : Number(pageData.parent_location_id);
    const childAvenueId = pageData.child_avenue_id === "all" || !pageData.child_avenue_id
      ? null
      : Number(pageData.child_avenue_id);
    const childSocietyId = pageData.child_society_id === "all" || !pageData.child_society_id
      ? null
      : Number(pageData.child_society_id);

    // Fetch parent details if provided
    let parentSlug = "";
    if (parentLocationId) {
      const [pRows]: any = await pool.query(
        "SELECT slug FROM parent_locations WHERE id = ?",
        [parentLocationId]
      );
      if (pRows && pRows.length > 0) {
        parentSlug = pRows[0].slug;
      } else {
        const [smRows]: any = await pool.query(
          "SELECT slug FROM sitemap_links WHERE id = ?",
          [parentLocationId]
        );
        if (smRows && smRows.length > 0) {
          parentSlug = smRows[0].slug;
        }
      }
    }

    // Support free-form or auto-generated custom URL
    let rawInput = String(pageData.slug || pageData.url || pageData.title || "").trim();
    let cleanedPath = rawInput
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .replace(/^sitemap\//, "")
      .replace(/[^a-z0-9\-_/]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanedPath) cleanedPath = `page-${Date.now().toString().slice(-4)}`;

    let targetUrl: string;
    let finalSlug: string;

    // If pageType is avenue/society and user didn't enter multi-segment path, prefix with parent
    if (parentSlug && (pageType === "avenue" || pageType === "society") && !cleanedPath.startsWith(parentSlug + "/")) {
      targetUrl = `/${parentSlug}/${cleanedPath}`;
      finalSlug = cleanedPath;
    } else {
      targetUrl = `/${cleanedPath}`;
      finalSlug = cleanedPath.split("/").pop() || cleanedPath;
    }

    // Check duplicate URL
    if (isEdit) {
      const [conflict]: any = await pool.query(
        "SELECT id, title FROM sitemap_links WHERE (url = ? OR slug = ?) AND id != ?",
        [targetUrl, targetUrl.replace(/^\/+/, ""), pageData.id]
      );
      if (conflict && conflict.length > 0) {
        return {
          success: false,
          error: `URL "${targetUrl}" is already in use by another page: "${conflict[0].title}". Please choose a distinct slug or path.`,
        };
      }

      // Check if URL changed on existing page; if so, record 301 Permanent Redirect
      const [oldRow]: any = await pool.query("SELECT url, status FROM sitemap_links WHERE id = ?", [pageData.id]);
      if (oldRow && oldRow.length > 0 && oldRow[0].url && oldRow[0].url !== targetUrl) {
        const oldUrl = oldRow[0].url;
        try {
          await pool.query(
            `INSERT INTO url_redirects (source_url, target_url, status_code) 
             VALUES (?, ?, 301) 
             ON DUPLICATE KEY UPDATE target_url = VALUES(target_url), status_code = 301`,
            [oldUrl, targetUrl]
          );
        } catch (redirErr) {
          console.error("Error registering 301 redirect:", redirErr);
        }
      }
    } else {
      const [existing]: any = await pool.query(
        "SELECT id, title FROM sitemap_links WHERE url = ? OR slug = ?",
        [targetUrl, targetUrl.replace(/^\/+/, "")]
      );
      if (existing && existing.length > 0) {
        return {
          success: false,
          error: `URL "${targetUrl}" already exists for page: "${existing[0].title}". Please customize the URL slug.`,
        };
      }
    }

    const url = targetUrl;
    const status = pageData.status || "published";
    const isActive = pageData.is_active !== undefined ? (pageData.is_active ? 1 : 0) : (status === "published" ? 1 : 0);
    const isIndexable = pageData.is_indexable !== undefined ? (pageData.is_indexable ? 1 : 0) : (status === "published" ? 1 : 0);
    const faqsJson = pageData.faqs ? (Array.isArray(pageData.faqs) ? JSON.stringify(pageData.faqs) : pageData.faqs) : null;
    const canonical = pageData.canonical_url?.trim() || url;
    const zoneId = pageData.zone_id === "all" || !pageData.zone_id ? null : Number(pageData.zone_id);
    const categoryId = pageData.category_id === "all" || !pageData.category_id ? null : Number(pageData.category_id);
    const serviceId = pageData.service_id === "all" || !pageData.service_id ? null : Number(pageData.service_id);

    if (isEdit) {
      await pool.query(
        `UPDATE sitemap_links SET
           title = ?, url = ?, slug = ?, page_type = ?, parent_id = ?,
           parent_location_id = ?, child_avenue_id = ?, child_society_id = ?,
           group_name = ?, city = ?, area = ?,
           category_id = ?, service_id = ?, zone_id = ?, priority = ?, changefreq = ?,
           is_active = ?, is_indexable = ?, status = ?, h1 = ?, h2 = ?, h3 = ?,
           meta_title = ?, meta_description = ?, subheading = ?, content = ?,
           faqs = ?, canonical_url = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          pageData.title.trim(),
          url,
          finalSlug,
          pageType,
          parentLocationId,
          parentLocationId,
          childAvenueId,
          childSocietyId,
          pageData.group_name || (parentLocationId ? "Child Location" : "Area-wise SEO"),
          pageData.city || null,
          pageData.area || null,
          categoryId,
          serviceId,
          zoneId,
          Number(pageData.priority) || 0.85,
          pageData.changefreq || "weekly",
          isActive,
          isIndexable,
          status,
          pageData.h1 || pageData.title.trim(),
          pageData.h2 || null,
          pageData.h3 || null,
          pageData.meta_title || pageData.title.trim(),
          pageData.meta_description || null,
          pageData.subheading || null,
          pageData.content || null,
          faqsJson,
          canonical,
          pageData.featured_image || null,
          pageData.id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO sitemap_links (
           title, url, slug, page_type, parent_id, parent_location_id, child_avenue_id, child_society_id,
           group_name, city, area, category_id, service_id, zone_id,
           priority, changefreq, is_active, is_indexable, is_system,
           status, h1, h2, h3, meta_title, meta_description, subheading,
           content, faqs, canonical_url, featured_image
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pageData.title.trim(),
          url,
          finalSlug,
          pageType,
          parentLocationId,
          parentLocationId,
          childAvenueId,
          childSocietyId,
          pageData.group_name || (parentLocationId ? "Child Location" : "Area-wise SEO"),
          pageData.city || null,
          pageData.area || null,
          categoryId,
          serviceId,
          zoneId,
          Number(pageData.priority) || 0.85,
          pageData.changefreq || "weekly",
          isActive,
          isIndexable,
          status,
          pageData.h1 || pageData.title.trim(),
          pageData.h2 || null,
          pageData.h3 || null,
          pageData.meta_title || pageData.title.trim(),
          pageData.meta_description || null,
          pageData.subheading || null,
          pageData.content || null,
          faqsJson,
          canonical,
          pageData.featured_image || null,
        ]
      );
    }

    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");
    revalidatePath(url);

    return { success: true, message: isEdit ? "Page updated successfully!" : "Page published successfully!", slug: finalSlug, url };
  } catch (error: any) {
    console.error("Error in saveSeoPage Server Action:", error);
    return { success: false, error: error.message || "Failed to save page" };
  }
}

// ==========================================
// 6. DUPLICATE SEO PAGE (DRAFT COPY)
// ==========================================

export async function duplicateSeoPage(id: number) {
  try {
    const [rows]: any = await pool.query("SELECT * FROM sitemap_links WHERE id = ?", [id]);
    if (!rows || rows.length === 0) return { success: false, error: "Original page not found" };

    const src = rows[0];
    const timestamp = Date.now().toString().slice(-4);
    const newSlug = `${src.slug || "page"}-copy-${timestamp}`;
    const newUrl = src.url ? `${src.url.replace(/\/+$/, "")}-copy-${timestamp}` : `/${newSlug}`;
    const newTitle = `${src.title} (Draft Copy)`;

    const [ins]: any = await pool.query(
      `INSERT INTO sitemap_links (
         title, url, slug, page_type, parent_id, parent_location_id, child_avenue_id, child_society_id,
         group_name, city, area, category_id, service_id, zone_id,
         priority, changefreq, is_active, is_indexable, is_system,
         status, h1, h2, h3, meta_title, meta_description, subheading,
         content, faqs, canonical_url, featured_image
       ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?, ?,
         ?, ?, 0, 0, FALSE,
         'draft', ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?
       )`,
      [
        newTitle,
        newUrl,
        newSlug,
        src.page_type || "service",
        src.parent_id,
        src.parent_location_id,
        src.child_avenue_id,
        src.child_society_id,
        src.group_name,
        src.city,
        src.area,
        src.category_id,
        src.service_id,
        src.zone_id,
        src.priority || 0.85,
        src.changefreq || "weekly",
        newTitle,
        src.h2,
        src.h3,
        newTitle,
        src.meta_description,
        src.subheading,
        src.content,
        src.faqs,
        newUrl,
        src.featured_image,
      ]
    );

    revalidatePath("/admin/seo");
    return { success: true, message: `Created Draft Copy: "${newTitle}"`, newId: ins.insertId };
  } catch (err: any) {
    console.error("Error duplicating page:", err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 7. DELETE & TOGGLE ACTIONS
// ==========================================

export async function deleteSeoPage(id: number) {
  try {
    const [row]: any = await pool.query("SELECT is_system, title FROM sitemap_links WHERE id = ?", [id]);
    if (!row || row.length === 0) return { success: false, error: "Page not found" };
    if (row[0].is_system) return { success: false, error: "Cannot delete system pages" };

    await pool.query("DELETE FROM sitemap_links WHERE id = ?", [id]);
    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");
    return { success: true, message: `Deleted ${row[0].title}` };
  } catch (error: any) {
    console.error("Error in deleteSeoPage:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleSeoPageStatus(id: number, nextStatus: "published" | "draft") {
  try {
    const isActive = nextStatus === "published" ? 1 : 0;
    await pool.query("UPDATE sitemap_links SET status = ?, is_active = ? WHERE id = ?", [nextStatus, isActive, id]);
    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");
    return { success: true, status: nextStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSeoPageIndexable(id: number, nextVal: boolean) {
  try {
    await pool.query("UPDATE sitemap_links SET is_indexable = ? WHERE id = ?", [nextVal ? 1 : 0, id]);
    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");
    return { success: true, is_indexable: nextVal };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 8. BULK GENERATION
// ==========================================

export async function bulkGenerateSeoPages(payload: {
  category_id?: number | null;
  service_id?: number | null;
  parent_location_id?: number | null;
  locations: string[];
  status?: "published" | "draft";
  is_indexable?: boolean;
}) {
  const { category_id, service_id, parent_location_id, locations, status = "published", is_indexable = false } = payload;
  if (!locations || locations.length === 0) {
    return { success: false, error: "No locations provided" };
  }

  try {
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

    let parentSlug = "";
    let parentCity = "Noida";
    let parentZoneId = null;

    if (parent_location_id) {
      const [parents]: any = await pool.query("SELECT name, slug, city, zone_id FROM parent_locations WHERE id = ?", [parent_location_id]);
      if (parents && parents.length > 0) {
        parentSlug = parents[0].slug;
        parentCity = parents[0].city;
        parentZoneId = parents[0].zone_id;
      }
    }

    const inserted: string[] = [];

    for (const rawLoc of locations) {
      const locName = rawLoc.trim();
      if (!locName) continue;

      const isGaur = /gaur\s*city/i.test(locName) || parentSlug.includes("gaur-city");
      const cityName = parentCity || (isGaur ? "Greater Noida West" : "Noida");

      const cleanLocSlug = sanitizeSlug(locName);
      const cleanServiceSlug = sanitizeSlug(serviceTitle);

      const url = parentSlug 
        ? `/${parentSlug}/${cleanLocSlug}/${cleanServiceSlug}`
        : `/${cleanServiceSlug}-${cleanLocSlug}`;
      const slug = parentSlug ? `${parentSlug}-${cleanLocSlug}-${cleanServiceSlug}` : `${cleanServiceSlug}-${cleanLocSlug}`;
      const pageTitle = `${serviceTitle} in ${locName}, ${cityName}`;
      const h1 = `${serviceTitle} in ${locName}`;
      const metaDesc = `Doorstep ${serviceTitle.toLowerCase()} in ${locName}, ${cityName}. Certified local technicians, same-day service, genuine spare parts, 45-day service warranty & 90-day parts warranty. Call 9999251966.`;

      const defaultFaqs = [
        {
          question: `How fast can a technician reach ${locName}?`,
          answer: `Most doorstep visits in ${locName} are scheduled within 60 to 90 minutes. Call 9999251966 for immediate booking.`,
        },
        {
          question: `Is there a warranty on ${serviceTitle} in ${locName}?`,
          answer: `Yes, all completed repairs include an official 45-day repair & service warranty and a 90-day warranty on genuine spare parts.`,
        },
      ];

      await pool.query(
        `INSERT INTO sitemap_links (
           title, url, slug, page_type, parent_location_id, group_name, city, area, category_id, service_id, zone_id,
           priority, changefreq, is_active, is_indexable, is_system,
           status, h1, h2, meta_title, meta_description, subheading,
           faqs, canonical_url
         ) VALUES (?, ?, ?, 'service', ?, 'Area-wise SEO', ?, ?, ?, ?, ?, 0.85, 'weekly', ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?)
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
          parent_location_id || null,
          cityName,
          locName,
          catId,
          service_id || null,
          parentZoneId,
          status === "published" ? 1 : 0,
          is_indexable ? 1 : 0,
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
      inserted.push(slug);
    }

    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");

    return {
      success: true,
      message: `Generated ${inserted.length} Dynamic SEO pages successfully!`,
      count: inserted.length,
    };
  } catch (error: any) {
    console.error("Error in bulkGenerateSeoPages:", error);
    return { success: false, error: error.message };
  }
}
