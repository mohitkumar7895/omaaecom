import type { Metadata } from "next";
import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CategoryView from "./CategoryView";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  if (!categoryId || isNaN(Number(categoryId))) {
    return { title: "Service Category | OMAA Company" };
  }

  try {
    const [catRows]: any = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    if (!catRows || catRows.length === 0) {
      return { title: "Services | OMAA Company" };
    }
    const cat = catRows[0];
    const catTitle = cat.title || "Appliance Service";

    let metaDescription = `Book expert doorstep ${catTitle} with OMAA Company in Delhi NCR. Genuine parts, certified technicians, upfront rate card & 30-day warranty.`;
    if (cat.id === 5 || catTitle.toLowerCase().includes("water purifier")) {
      metaDescription = "Top-rated RO water purifier repair, regular maintenance & filter replacement service at your doorstep. 30-day warranty & genuine parts across Delhi NCR.";
    } else if (cat.id === 7 || catTitle.toLowerCase().includes("ro amc")) {
      metaDescription = "Affordable RO AMC annual maintenance plans for Kent, Aquafresh, Livpure, Aqua Grand & all brands. Unlimited breakdown visits & filter changes.";
    } else if (cat.id === 2 || catTitle.toLowerCase().includes("refrigerator")) {
      metaDescription = "Doorstep refrigerator repair service for single-door, double-door & inverter fridges. Fast cooling issue diagnosis, compressor service & 30-day warranty.";
    } else if (cat.id === 3 || catTitle.toLowerCase().includes("washing machine")) {
      metaDescription = "Doorstep washing machine repair & deep jet service for top load, front load & semi-automatic machines in Delhi NCR with a 30-day service guarantee.";
    }

    return {
      title: `${catTitle} - Doorstep Repair & Services | OMAA Company`,
      description: metaDescription,
      alternates: {
        canonical: `${siteUrl}/services/${categoryId}`,
      },
      openGraph: {
        title: `${catTitle} - Doorstep Repair & Services | OMAA Company`,
        description: metaDescription,
        url: `${siteUrl}/services/${categoryId}`,
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: catTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${catTitle} - Doorstep Repair | OMAA Company`,
        description: metaDescription,
        images: ["/og-image.jpg"],
      },
    };
  } catch (error) {
    return {
      title: "Services | OMAA Company",
    };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  if (!categoryId || isNaN(Number(categoryId))) {
    return notFound();
  }

  try {
    // Fetch all required data in parallel
    const [
      [catRows],
      [subcats],
      [servicesRows],
      [rateCards]
    ] = (await Promise.all([
      pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]),
      pool.query("SELECT * FROM subcategories WHERE category_id = ?", [categoryId]),
      pool.query("SELECT * FROM services WHERE category_id = ?", [categoryId]),
      pool.query(`
        SELECT rc.*, h.title as heading_title 
        FROM rate_cards rc
        LEFT JOIN rate_headings h ON rc.heading_id = h.id
        WHERE rc.category_id = ?
        ORDER BY rc.id ASC
      `, [categoryId])
    ])) as any[];

    if (!catRows || catRows.length === 0) {
      return notFound();
    }
    const category = catRows[0];

    const services = servicesRows.map((s: any) => ({
      ...s,
      short_description: category.short_description,
      warranty_days: category.warranty_days,
    }));

    const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
    const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

    const categorySchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteUrl,
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Services",
              "item": `${siteUrl}/services`,
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": category.title,
              "item": `${siteUrl}/services/${categoryId}`,
            },
          ],
        },
        {
          "@type": "Service",
          "name": category.title,
          "serviceType": category.title,
          "description": `Certified doorstep ${category.title} repair and maintenance with 30-day warranty in Delhi NCR.`,
          "provider": {
            "@type": "LocalBusiness",
            "name": "OMAA Company",
            "telephone": "+919999251966",
            "url": siteUrl,
          },
          "areaServed": [
            { "@type": "City", name: "Delhi" },
            { "@type": "City", name: "Noida" },
            { "@type": "City", name: "Greater Noida" },
            { "@type": "City", name: "Ghaziabad" },
            { "@type": "City", name: "Gurgaon" },
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": `${category.title} Service Offerings`,
            "itemListElement": services.map((s: any) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": s.title,
              },
              "price": s.selling_price || "199.00",
              "priceCurrency": "INR",
            })),
          },
        },
      ],
    };

    return (
      <main className="min-h-screen bg-white flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
        />
        <Navbar />
        
        {/* Pass data to the Client Component that will handle the layout and interactions */}
        <div className="flex-grow">
          <CategoryView 
            category={category} 
            subcategories={subcats} 
            services={services} 
            rateCards={rateCards}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Database error in CategoryPage:", error);
    return notFound();
  }
}
