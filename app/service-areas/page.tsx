import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SitemapClient from "../sitemap-directory/SitemapClient";
import { getSiteUrl } from "../../lib/site-url";
import pool from "../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Service Areas & Sitemap Directory | OMAA Company",
  description:
    "Explore all verified OMAA Company appliance repair service areas, sectors, and localities across Noida, Greater Noida, Gaur City 2, Ghaziabad, Delhi NCR, and Gurgaon.",
  alternates: { canonical: `${siteUrl}/service-areas` },
};

export default async function ServiceAreasPage() {
  let links: any[] = [];
  try {
    const [rows]: any = await pool.query(
      `SELECT id, title, slug, url, group_name, city, area, priority, changefreq 
       FROM sitemap_links 
       WHERE is_active = TRUE AND (status = 'published' OR status IS NULL) 
       ORDER BY priority DESC, title ASC`
    );
    links = (rows || []).map((row: any) => ({
      ...row,
      url: row.url || (row.slug ? `/${String(row.slug).replace(/^\/+/, '')}` : "/"),
    }));
  } catch (e) {
    console.error("Error loading sitemap links for service-areas:", e);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow">
        <SitemapClient initialLinks={links} />
      </div>
      <Footer />
    </main>
  );
}
