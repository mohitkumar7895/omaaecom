import { SEO_LOCATIONS } from "@/lib/seo-locations";
import { SEO_SERVICES } from "@/lib/seo-services";
import { SEO_KEYWORD_PAGES } from "@/lib/seo-keywords";
import { GAUR_CITY_SOCIETIES, GAUR_CITY_SERVICES } from "@/lib/gaur-city-data";
import { getSiteUrl, toCanonicalUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

function safeDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function safePriority(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  if (!Number.isFinite(n)) return 0.8;
  return Math.min(1, Math.max(0, n));
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function buildStaticSitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/service-areas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/5`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/7`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/2`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/3`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services/1`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/rate-card`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/complaint`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  for (const kw of SEO_KEYWORD_PAGES) {
    pages.push({
      url: `${baseUrl}/${kw.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }

  for (const loc of SEO_LOCATIONS) {
    pages.push({
      url: `${baseUrl}/${loc.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: loc.kind === "society" ? 0.9 : 0.8,
    });
    for (const svc of SEO_SERVICES) {
      pages.push({
        url: `${baseUrl}/${loc.slug}/${svc.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  // Gaur City 2 Hub and nested Society pages
  pages.push({
    url: `${baseUrl}/gaur-city-2`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
  });

  for (const soc of GAUR_CITY_SOCIETIES) {
    pages.push({
      url: `${baseUrl}/gaur-city-2/${soc.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: soc.isCore ? 0.9 : 0.85,
    });
    for (const svcKey of Object.keys(GAUR_CITY_SERVICES)) {
      pages.push({
        url: `${baseUrl}/gaur-city-2/${soc.slug}/${svcKey}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  return pages.filter((page) => isHttpUrl(page.url));
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = buildStaticSitemap();
  const baseUrl = getSiteUrl();

  try {
    const pool = (await import("@/lib/db")).default;
    const query = pool.query(
      "SELECT url, priority, changefreq, updated_at FROM sitemap_links WHERE is_active = TRUE ORDER BY priority DESC, id ASC LIMIT 400"
    );
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("sitemap db timeout")), 2500);
    });
    const [rows]: any = await Promise.race([query, timeout]);

    if (!rows || rows.length === 0) return staticPages;

    const seen = new Set<string>();
    const merged: MetadataRoute.Sitemap = [];
    const hidden = new Set([
      `${baseUrl}/sitemap`,
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-directory`,
      `${baseUrl}/sitemap-pages`,
    ]);
    const validFreqs = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);

    for (const row of rows) {
      let fullUrl = String(row.url || "").trim();
      if (!fullUrl) continue;
      if (!fullUrl.startsWith("http")) {
        fullUrl = `${baseUrl}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
      }
      const url = toCanonicalUrl(fullUrl);
      if (!isHttpUrl(url) || hidden.has(url) || seen.has(url)) continue;
      seen.add(url);

      const freq = String(row.changefreq || "weekly").toLowerCase();
      merged.push({
        url,
        lastModified: safeDate(row.updated_at),
        changeFrequency: (validFreqs.has(freq) ? freq : "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: safePriority(row.priority),
      });
    }

    for (const page of staticPages) {
      if (seen.has(page.url)) continue;
      seen.add(page.url);
      merged.push(page);
    }

    return merged;
  } catch (error) {
    console.error("Error dynamically generating sitemap.xml:", error);
    return staticPages;
  }
}
