"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getUnifiedLocations } from "@/lib/seo-locations-provider";

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
  page?: number;
  limit?: number;
}

export async function getParentLocations() {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, title, slug, url, page_type 
       FROM sitemap_links 
       WHERE page_type = 'location' OR (parent_id IS NULL AND url LIKE '/%')
       ORDER BY title ASC`
    );
    return { success: true, parents: rows || [] };
  } catch (err: any) {
    console.error("Error fetching parent locations:", err);
    return { success: false, parents: [] };
  }
}

export async function getParentLocationWithChildren(parentSlug: string) {
  try {
    const cleanSlug = parentSlug.replace(/^\/+|\/+$/g, "");
    const [parentRows]: any = await pool.query(
      "SELECT * FROM sitemap_links WHERE slug = ? OR url = ? OR url = ? LIMIT 1",
      [cleanSlug, `/${cleanSlug}`, `/${cleanSlug}/`]
    );
    if (!parentRows || parentRows.length === 0) return null;
    const parent = parentRows[0];
    const [children]: any = await pool.query(
      `SELECT id, title, slug, url, page_type, h1, meta_title, meta_description, status, is_active, is_indexable, priority 
       FROM sitemap_links 
       WHERE parent_id = ? AND status = 'published' AND is_active = 1 
       ORDER BY title ASC`,
      [parent.id]
    );
    return { parent, children: children || [] };
  } catch (err: any) {
    console.error("Error fetching parent location with children:", err);
    return null;
  }
}

export async function getSeoPages(params: SeoFilterParams = {}) {
  const {
    search = "",
    status = "all",
    indexable = "all",
    category_id,
    zone_id,
    page_type = "all",
    parent_id = "all",
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
      whereClause += " AND parent_id = ?";
      queryParams.push(parseInt(parent_id, 10));
    }

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM sitemap_links ${whereClause}`,
      queryParams
    );
    const totalFiltered = Number(countRows[0]?.total || 0);

    const [rows]: any = await pool.query(
      `SELECT 
         id, title, url, slug, page_type, parent_id, group_name, city, area, category_id, service_id, zone_id,
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

export async function saveSeoPage(pageData: any) {
  try {
    const isEdit = Boolean(pageData.id);
    const pageType = pageData.page_type || "service";
    const parentId = pageData.parent_id ? Number(pageData.parent_id) : null;

    let parentUrlPrefix = "";
    if (parentId) {
      const [parentRow]: any = await pool.query(
        "SELECT id, url, slug FROM sitemap_links WHERE id = ?",
        [parentId]
      );
      if (parentRow && parentRow.length > 0) {
        parentUrlPrefix = String(parentRow[0].url || `/${parentRow[0].slug}`).replace(/\/+$/, "");
      }
    }

    // Support ANY custom URL (single or multi-segment)
    let rawInput = String(pageData.url || pageData.slug || pageData.title || "").trim();
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
    let slug: string;

    if (parentId && parentUrlPrefix) {
      const cleanParent = parentUrlPrefix.replace(/^\/+|\/+$/g, "");
      if (cleanedPath === cleanParent || cleanedPath.startsWith(cleanParent + "/")) {
        targetUrl = `/${cleanedPath}`;
        slug = cleanedPath.split("/").pop() || cleanedPath;
      } else {
        targetUrl = `${parentUrlPrefix}/${cleanedPath}`;
        slug = cleanedPath.split("/").pop() || cleanedPath;
      }
    } else {
      // Free-form: ANY custom URL path!
      targetUrl = `/${cleanedPath}`;
      slug = cleanedPath.split("/").pop() || cleanedPath;
    }

    if (isEdit) {
      const [conflict]: any = await pool.query(
        "SELECT id FROM sitemap_links WHERE (slug = ? OR url = ?) AND id != ?",
        [slug, targetUrl, pageData.id]
      );
      if (conflict && conflict.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
        targetUrl = parentId && parentUrlPrefix ? `${parentUrlPrefix}/${slug}` : `/${slug}`;
      }

      // Check if URL changed on a published page; create 301 redirect if so
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
        "SELECT id FROM sitemap_links WHERE slug = ? OR url = ?",
        [slug, targetUrl]
      );
      if (existing && existing.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
        targetUrl = parentUrlPrefix ? `${parentUrlPrefix}/${slug}` : `/${slug}`;
      }
    }

    const url = targetUrl;
    const status = pageData.status || "published";
    const isActive = pageData.is_active !== undefined ? (pageData.is_active ? 1 : 0) : (status === "published" ? 1 : 0);
    const isIndexable = pageData.is_indexable !== undefined ? (pageData.is_indexable ? 1 : 0) : 0;
    const faqsJson = pageData.faqs ? (Array.isArray(pageData.faqs) ? JSON.stringify(pageData.faqs) : pageData.faqs) : null;
    const canonical = pageData.canonical_url?.trim() || url;

    const zoneId = pageData.zone_id ? Number(pageData.zone_id) : null;

    if (isEdit) {
      await pool.query(
        `UPDATE sitemap_links SET
           title = ?, url = ?, slug = ?, page_type = ?, parent_id = ?,
           group_name = ?, city = ?, area = ?,
           category_id = ?, service_id = ?, zone_id = ?, priority = ?, changefreq = ?,
           is_active = ?, is_indexable = ?, status = ?, h1 = ?, h2 = ?, h3 = ?,
           meta_title = ?, meta_description = ?, subheading = ?, content = ?,
           faqs = ?, canonical_url = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          pageData.title.trim(),
          url,
          slug,
          pageType,
          parentId,
          pageData.group_name || (parentId ? "Child Location" : "Area-wise SEO"),
          pageData.city || null,
          pageData.area || null,
          pageData.category_id ? Number(pageData.category_id) : null,
          pageData.service_id ? Number(pageData.service_id) : null,
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
           title, url, slug, page_type, parent_id, group_name, city, area, category_id, service_id, zone_id,
           priority, changefreq, is_active, is_indexable, is_system,
           status, h1, h2, h3, meta_title, meta_description, subheading,
           content, faqs, canonical_url, featured_image
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pageData.title.trim(),
          url,
          slug,
          pageType,
          parentId,
          pageData.group_name || (parentId ? "Child Location" : "Area-wise SEO"),
          pageData.city || null,
          pageData.area || null,
          pageData.category_id ? Number(pageData.category_id) : null,
          pageData.service_id ? Number(pageData.service_id) : null,
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

    return { success: true, message: isEdit ? "Page updated!" : "Page published!", slug, url };
  } catch (error: any) {
    console.error("Error in saveSeoPage Server Action:", error);
    return { success: false, error: error.message || "Failed to save page" };
  }
}

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

export async function bulkGenerateSeoPages(payload: {
  category_id?: number | null;
  service_id?: number | null;
  locations: string[];
  status?: "published" | "draft";
  is_indexable?: boolean;
}) {
  const { category_id, service_id, locations, status = "published", is_indexable = false } = payload;
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

    const inserted: string[] = [];

    for (const rawLoc of locations) {
      const locName = rawLoc.trim();
      if (!locName) continue;

      const isGaur = /gaur\s*city/i.test(locName);
      const cityName = isGaur ? "Greater Noida" : "Noida";

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
