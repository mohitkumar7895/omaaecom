import type { MetadataRoute } from "next";
import { buildSitemap, buildStaticSitemap } from "@/lib/build-sitemap";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemap();
  } catch (error) {
    console.error("sitemap.xml hard fallback:", error);
    return buildStaticSitemap();
  }
}
