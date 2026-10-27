import { Metadata } from "next";
import pool from "@/lib/db";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SitemapClient from "@/app/sitemap-directory/SitemapClient";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Sitemap & Service Directory | OMAA Company",
  description:
    "Browse all home appliance repair, maintenance, and installation services across Noida, Greater Noida, Ghaziabad, Delhi NCR, and Gurgaon. Find local service areas and book doorstep repairs.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${siteUrl}/service-areas`,
  },
};

export default async function SitemapPage() {
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
  } catch (error) {
    console.error("Error loading sitemap page:", error);
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
