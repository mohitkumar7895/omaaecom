import type { MetadataRoute } from "next";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://omaacompany.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  try {
    const [rows]: any = await pool.query(
      "SELECT url, priority, changefreq, updated_at FROM sitemap_links WHERE is_active = TRUE ORDER BY priority DESC, id ASC"
    );

    if (!rows || rows.length === 0) {
      return [
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 1.0,
        },
      ];
    }

    return rows.map((row: any) => {
      let fullUrl = row.url.trim();
      if (!fullUrl.startsWith("http")) {
        fullUrl = `${baseUrl}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
      }

      const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
      const freq = validFreqs.includes(row.changefreq?.toLowerCase())
        ? row.changefreq.toLowerCase()
        : "weekly";

      return {
        url: fullUrl,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: freq as any,
        priority: typeof row.priority === "number" ? row.priority : parseFloat(row.priority) || 0.8,
      };
    });
  } catch (error) {
    console.error("Error dynamically generating sitemap.xml:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
