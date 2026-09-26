import type { MetadataRoute } from "next";
import pool from "@/lib/db";
import { SEO_LOCATIONS } from "@/lib/seo-locations";
import { SEO_SERVICES } from "@/lib/seo-services";
import { SEO_KEYWORD_PAGES } from "@/lib/seo-keywords";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const defaultPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/service-areas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
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
  ];

  for (const kw of SEO_KEYWORD_PAGES) {
    defaultPages.push({
      url: `${baseUrl}/${kw.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }

  for (const loc of SEO_LOCATIONS) {
    defaultPages.push({
      url: `${baseUrl}/${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: loc.kind === "society" ? 0.9 : 0.8,
    });
    for (const svc of SEO_SERVICES) {
      defaultPages.push({
        url: `${baseUrl}/${loc.slug}/${svc.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT url, priority, changefreq, updated_at FROM sitemap_links WHERE is_active = TRUE ORDER BY priority DESC, id ASC LIMIT 400"
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

      let normalizedUrl = fullUrl.endsWith("/") ? fullUrl.slice(0, -1) : fullUrl;

      const hiddenFromGoogle = [
        `${baseUrl}/sitemap`,
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-directory`,
        `${baseUrl}/sitemap-pages`,
      ];
      if (hiddenFromGoogle.includes(normalizedUrl)) continue;

      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);

      const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
      const freq = validFreqs.includes(row.changefreq?.toLowerCase())
        ? row.changefreq.toLowerCase()
        : "weekly";

      dbSitemap.push({
        url: normalizedUrl,
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
