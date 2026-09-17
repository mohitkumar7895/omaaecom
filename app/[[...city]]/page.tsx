import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import NewProductsSection from "../components/NewProductsSection";
import HomeCategoryStream from "../components/HomeCategoryStream";
import Footer from "../components/Footer";
import pool from "../../lib/db";

// Dynamic rendering to reflect live booking ratings in real time
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ city?: string[] }>;
  searchParams: Promise<{ area?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const citySegments = resolvedParams.city || [];
  const citySlug = citySegments[0] || "";
  const areaSlug = resolvedSearchParams.area || citySegments[1] || "";

  if (!citySlug) {
    // Root Homepage SEO
    return {
      title: "OMAA Company - Doorstep Appliance Repair | RO, Fridge, Washing Machine",
      description:
        "Book certified doorstep repair services for RO water purifiers, refrigerators, washing machines, and ACs. Upfront pricing, 30-day warranty, and same-day expert visit in Delhi NCR.",
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title: "OMAA Company - Doorstep Appliance Repair | RO, Fridge, Washing Machine",
        description:
          "Fast, reliable doorstep repair for RO purifiers, refrigerators, washing machines & ACs in Delhi NCR. 30-day warranty on all repairs.",
        url: siteUrl,
        type: "website",
        images: [
          {
            url: "/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "OMAA Company Home Appliance Repair",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "OMAA Company - Doorstep Appliance Repair | RO, Fridge, Washing Machine",
        description:
          "Fast, reliable doorstep repair for RO purifiers, refrigerators, washing machines & ACs in Delhi NCR with 30-day warranty.",
        images: ["/og-image.jpg"],
      },
    };
  }

  // City or Area Landing SEO
  const formatLocation = (slug: string) =>
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const formattedCity = formatLocation(citySlug);
  const formattedArea = areaSlug ? formatLocation(areaSlug) : "";
  const locationTitle = formattedArea ? `${formattedArea}, ${formattedCity}` : formattedCity;
  const pagePath = areaSlug ? `/${citySlug}?area=${encodeURIComponent(areaSlug)}` : `/${citySlug}`;

  // Hyper-optimized SEO specific for Gaur City 2 target keywords
  if (citySlug.startsWith("gaur-city-2")) {
    return {
      title: `RO, Refrigerator & Washing Machine Repair in ${locationTitle} | Call 9999251966`,
      description: `Expert doorstep RO repair, Refrigerator servicing, and Washing Machine repair in ${locationTitle}. Call 9999251966 for verified technicians, instant booking, and 30-day service warranty.`,
      alternates: {
        canonical: `${siteUrl}${pagePath}`,
      },
      openGraph: {
        title: `RO, Refrigerator & Washing Machine Repair in ${locationTitle} | Call 9999251966`,
        description: `Need RO, fridge, or washing machine repair in ${locationTitle}? Call 9999251966. Certified technicians at your doorstep within 60 minutes with 30-day warranty.`,
        url: `${siteUrl}${pagePath}`,
        images: [
          {
            url: "/og-image.jpg",
            width: 1200,
            height: 630,
            alt: `Appliance Repair in ${locationTitle}`,
          },
        ],
      },
    };
  }

  // Default SEO for all other locations
  return {
    title: `Appliance Repair in ${locationTitle} | RO, Refrigerator, Washing Machine - OMAA Company`,
    description: `Expert doorstep RO repair, refrigerator servicing, and washing machine repair in ${locationTitle}. Verified local technicians, instant booking, and 30-day service warranty.`,
    alternates: {
      canonical: `${siteUrl}${pagePath}`,
    },
    openGraph: {
      title: `Appliance Repair in ${locationTitle} | OMAA Company`,
      description: `Need RO, fridge, or washing machine repair in ${locationTitle}? Certified technicians at your doorstep within 60 minutes with 30-day warranty.`,
      url: `${siteUrl}${pagePath}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Appliance Repair in ${locationTitle}`,
        },
      ],
    },
  };
}

export default async function Home({ params, searchParams }: PageProps) {
  let categories: any[] = [];
  let desktopBanners: any[] = [];
  let mobileBanners: any[] = [];

  try {
    // Fetch all required data in parallel to massively improve page load speed
    const [
      bResult,
      catResult,
      servicesResult,
      desktopResult,
      mobileResult
    ] = await Promise.allSettled([
      pool.query("SELECT category, services, rating FROM bookings WHERE rating IS NOT NULL AND rating > 0"),
      pool.query("SELECT * FROM categories WHERE status = 'Active'"),
      pool.query("SELECT * FROM services"),
      pool.query("SELECT * FROM banners WHERE type = 'desktop' OR type IS NULL ORDER BY created_at DESC LIMIT 1"),
      pool.query("SELECT * FROM banners WHERE type = 'mobile' ORDER BY created_at DESC LIMIT 1")
    ]);

    let bookingRatings: any[] = [];
    if (bResult.status === 'fulfilled') {
      const [bRows]: any = bResult.value;
      bookingRatings = bRows || [];
    }

    let catRows: any[] = [];
    if (catResult.status === 'fulfilled') {
      const [rows]: any = catResult.value;
      catRows = rows || [];
    }

    let allServices: any[] = [];
    if (servicesResult.status === 'fulfilled') {
      const [rows]: any = servicesResult.value;
      allServices = rows || [];
    }
    
    // Process categories and their associated services
    categories = catRows.map((cat: any) => {
      // Filter services for this category from the pre-fetched list
      const services = allServices.filter((s: any) => s.category_id === cat.id);
      
      const enhancedServices = services.map((srv: any) => {
        // Find matching booking reviews for this service / category
        const matching = bookingRatings.filter((b) => {
          const matchesCategory = b.category && cat.title && b.category.toLowerCase().includes(cat.title.toLowerCase());
          let matchesService = false;
          try {
            if (b.services) {
              const srvStr = typeof b.services === 'string' ? b.services : JSON.stringify(b.services);
              matchesService = srvStr.toLowerCase().includes(srv.title.toLowerCase());
            }
          } catch {}
          return matchesService || matchesCategory;
        });

        if (matching.length > 0) {
          const sum = matching.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
          const liveAvg = (sum / matching.length).toFixed(1);
          return {
            ...srv,
            rating: liveAvg,
            reviews: `${matching.length}+`,
          };
        }

        return {
          ...srv,
          rating: srv.rating || "4.8",
          reviews: srv.reviews || "120+",
        };
      });

      return {
        ...cat,
        services: enhancedServices,
      };
    });

    // Fetch desktop banners
    if (desktopResult.status === 'fulfilled') {
      const [desktopRows]: any = desktopResult.value;
      if (desktopRows && desktopRows.length > 0) {
        const row = desktopRows[0];
        if (row.banner1_url) desktopBanners.push(row.banner1_url);
        if (row.banner2_url) desktopBanners.push(row.banner2_url);
        if (row.banner3_url) desktopBanners.push(row.banner3_url);
      }
    }

    // Fetch mobile banners
    if (mobileResult.status === 'fulfilled') {
      const [mobileRows]: any = mobileResult.value;
      if (mobileRows && mobileRows.length > 0) {
        const row = mobileRows[0];
        if (row.banner1_url) mobileBanners.push(row.banner1_url);
        if (row.banner2_url) mobileBanners.push(row.banner2_url);
        if (row.banner3_url) mobileBanners.push(row.banner3_url);
      }
    }

  } catch (error) {
    console.error("Database connection error on Home page:", error);
  }

    const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
    const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

    const homepageSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          "url": siteUrl,
          "name": "OMAA Company",
          "description": "Doorstep Appliance Repair and Maintenance Services",
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/services?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          ]
        },
        {
          "@type": "ItemList",
          "@id": `${siteUrl}/#services-list`,
          "name": "Doorstep Appliance Repair Services",
          "itemListElement": [
            {
              "@type": "Service",
              "position": 1,
              "name": "RO Repair and Service",
              "description": "Comprehensive doorstep water purifier and RO servicing, filter replacement, TDS calibration, and annual maintenance contracts (AMC).",
              "provider": { "@type": "LocalBusiness", "name": "OMAA Company" },
              "offers": { "@type": "Offer", "price": "160.00", "priceCurrency": "INR" }
            },
            {
              "@type": "Service",
              "position": 2,
              "name": "Refrigerator Repair",
              "description": "Expert repair for single-door, double-door, side-by-side, and inverter refrigerators. Power issue, cooling problems, water leakage, and compressor repairs.",
              "provider": { "@type": "LocalBusiness", "name": "OMAA Company" },
              "offers": { "@type": "Offer", "price": "199.00", "priceCurrency": "INR" }
            },
            {
              "@type": "Service",
              "position": 3,
              "name": "Washing Machines Repair",
              "description": "Doorstep repair & jet cleaning for top-load, front-load, and semi-automatic washing machines with genuine parts and a 30-day warranty.",
              "provider": { "@type": "LocalBusiness", "name": "OMAA Company" },
              "offers": { "@type": "Offer", "price": "199.00", "priceCurrency": "INR" }
            }
          ]
        }
      ]
    };

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
        />
        <Navbar />
        <Hero categories={categories} banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners} />
        
        {/* New Products Section above RO AMC */}
        <NewProductsSection />
        
        {/* Exact Order: RO AMC -> Banner 1 -> AC Repair -> Refrigerator -> Banner 2 -> Washing Machine -> Microwave -> Banner 3 -> Water Purifier with Zone Filtering */}
        <HomeCategoryStream 
          initialCategories={categories} 
          banners={desktopBanners} 
        />
        
        {/* Footer is rendered strictly on the Home Page */}
        <Footer />
      </main>
    );
  }
