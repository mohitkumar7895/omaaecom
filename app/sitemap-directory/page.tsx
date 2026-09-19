import { Metadata } from "next";
import pool from "@/lib/db";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SitemapClient from "@/app/sitemap-directory/SitemapClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sitemap & Service Directory | OMAA Company",
  description:
    "Browse all home appliance repair, maintenance, and installation services across Noida, Greater Noida, Ghaziabad, Delhi NCR, and Gurgaon. Find local service areas and book doorstep repairs.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/sitemap-directory",
  },
};

export default async function SitemapPage() {
  let links: any[] = [];

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM sitemap_links WHERE is_active = TRUE ORDER BY priority DESC, title ASC"
    );
    links = rows || [];
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
