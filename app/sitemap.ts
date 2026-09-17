import type { MetadataRoute } from "next";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const defaultPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/services/5`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/7`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/2`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/3`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/1`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/rate-card`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/complaint`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/noida`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/delhi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/greater-noida`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/ghaziabad`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gurgaon`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
<<<<<<< HEAD
    { url: `${baseUrl}/gaur-city-2-10th-avenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-11th-avenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-12th-avenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-14th-avenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-14th-avenue-phase-1`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-14th-avenue-phase-2`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gaur-city-2-16th-avenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
=======
>>>>>>> e1188c7b0ff9a791f56bae097d046e40ba9efaff
  ];

  try {
    const [rows]: any = await pool.query(
      "SELECT url, priority, changefreq, updated_at FROM sitemap_links WHERE is_active = TRUE ORDER BY priority DESC, id ASC"
    );

    if (!rows || rows.length === 0) {
      return defaultPages;
    }

    const seenUrls = new Set<string>();
    const dbSitemap: MetadataRoute.Sitemap = [];

    for (const row of rows) {
      let fullUrl = (row.url || "").trim();
      if (!fullUrl) continue;
      if (!fullUrl.startsWith("http")) {
        fullUrl = `${baseUrl}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
      }

<<<<<<< HEAD
      // Normalize trailing slash for deduplication
      const normalizedUrl = fullUrl.endsWith("/") ? fullUrl.slice(0, -1) : fullUrl;

      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);
=======
      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);
>>>>>>> e1188c7b0ff9a791f56bae097d046e40ba9efaff

      const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
      const freq = validFreqs.includes(row.changefreq?.toLowerCase())
        ? row.changefreq.toLowerCase()
        : "weekly";

      dbSitemap.push({
<<<<<<< HEAD
        url: normalizedUrl,
=======
        url: fullUrl,
>>>>>>> e1188c7b0ff9a791f56bae097d046e40ba9efaff
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: freq as any,
        priority: typeof row.priority === "number" ? row.priority : parseFloat(row.priority) || 0.8,
      });
    }

    // Merge any missing default core pages into the sitemap
    for (const def of defaultPages) {
      if (!seenUrls.has(def.url)) {
        dbSitemap.push(def);
        seenUrls.add(def.url);
      }
    }

    return dbSitemap;
  } catch (error) {
    console.error("Error dynamically generating sitemap.xml:", error);
    return defaultPages;
  }
}
