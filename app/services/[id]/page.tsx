import type { Metadata } from "next";
import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import { publicAssetUrl } from "../../../lib/public-media";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CategoryView from "./CategoryView";
import { absoluteTitle } from "../../../lib/seo-locations";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  if (!categoryId || isNaN(Number(categoryId))) {
    return { title: absoluteTitle("Service Category | OMAA Company"), robots: { index: false, follow: true } };
  }

  try {
    const [catRows]: any = await pool.query("SELECT id, title FROM categories WHERE id = ?", [categoryId]);
    if (!catRows || catRows.length === 0) {
      return { title: absoluteTitle("Services | OMAA Company"), robots: { index: false, follow: true } };
    }
    const cat = catRows[0];
    const catTitle = cat.title || "Appliance Service";

    let pageTitle = `${catTitle} in Delhi NCR | Doorstep Repair & Service`;
    let metaDescription = `Book expert doorstep ${catTitle} with OMAA Company in Delhi NCR. Genuine parts, certified technicians, upfront rate card & 30-day warranty.`;
    if (cat.id === 1 || catTitle.toLowerCase().includes("ac repair")) {
      metaDescription = "Doorstep AC repair, foam jet service, gas refill and installation in Delhi NCR. Split and window AC servicing with 30-day warranty.";
    } else if (cat.id === 5 || catTitle.toLowerCase().includes("water purifier")) {
      pageTitle = "RO Repair Near Me | Water Purifier Repair Noida";
      metaDescription = "RO repair near me, RO service near me and water purifier repair near me in Noida. Filter, TDS and leakage at home. Call 9999251966.";
    } else if (cat.id === 7 || catTitle.toLowerCase().includes("ro amc")) {
      metaDescription = "Affordable RO AMC annual maintenance plans for Kent, Aquafresh, Livpure, Aqua Grand & all brands. Unlimited breakdown visits & filter changes.";
    } else if (cat.id === 2 || catTitle.toLowerCase().includes("refrigerator")) {
      pageTitle = "Refrigerator Repair Near Me | Fridge Repair Noida";
      metaDescription = "Refrigerator repair near me, fridge repair near me and refrigerator technician near me in Noida. Same-day cooling and gas service. Call 9999251966.";
    } else if (cat.id === 3 || catTitle.toLowerCase().includes("washing machine")) {
      pageTitle = "Washing Machine Repair Near Me | Washing Machine Repair Noida";
      metaDescription = "Washing machine repair near me, washing machine service near me and washing machine technician near me in Noida. Call 9999251966.";
    }

    return {
      title: absoluteTitle(pageTitle),
      description: metaDescription,
      alternates: {
        canonical: `${siteUrl}/services/${categoryId}`,
      },
      openGraph: {
        title: pageTitle,
        description: metaDescription,
        url: `${siteUrl}/services/${categoryId}`,
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: catTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: metaDescription,
        images: ["/og-image.jpg"],
      },
    };
  } catch (error) {
    return {
      title: absoluteTitle("Services | OMAA Company"),
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
      pool.query("SELECT id, title, image_url, short_description, type FROM categories WHERE id = ?", [categoryId]),
      pool.query("SELECT id, title, category_id FROM subcategories WHERE category_id = ?", [categoryId]),
      pool.query(
        "SELECT id, category_id, subcategory_id, title, rating, selling_price, original_price, warranty_days, short_description, image_url FROM services WHERE category_id = ?",
        [categoryId]
      ),
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
    const category = { ...catRows[0], image_url: publicAssetUrl(catRows[0].image_url) };

    const services = servicesRows.map((s: any) => ({
      ...s,
      image_url: publicAssetUrl(s.image_url) || (s.image_url ? `/api/media/service/${s.id}` : ""),
      short_description: s.short_description || category.short_description,
      warranty_days: s.warranty_days,
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
          "url": `${siteUrl}/services/${categoryId}`,
          "image": category.image_url || `${siteUrl}/og-image.jpg`,
          "description": `Certified doorstep ${category.title} in Delhi NCR with 30-day warranty.`,
          "provider": {
            "@id": `${siteUrl}/#business`,
            "@type": "HomeAndConstructionBusiness",
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
        },
        {
          "@type": "ItemList",
          "name": `${category.title} options`,
          "itemListElement": services.slice(0, 20).map((s: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": s.title,
            "url": `${siteUrl}/services/${categoryId}`,
          })),
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
        <Footer />
      </main>
    );
  } catch (error) {
    console.error("Database error in CategoryPage:", error);
    return notFound();
  }
}
