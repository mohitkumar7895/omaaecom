import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import NewProductsSection from "../components/NewProductsSection";
import HomeCategoryStream from "../components/HomeCategoryStream";
import Footer from "../components/Footer";
import pool from "../../lib/db";
import { absoluteTitle, getSeoLocation } from "../../lib/seo-locations";
import { getSeoService } from "../../lib/seo-services";
import {
  getKeywordPage,
  keywordFitsLocation,
  keywordHeading,
  keywordService,
} from "../../lib/seo-keywords";
import LocationSeoSection from "../components/LocationSeoSection";

// Dynamic rendering to reflect live booking ratings in real time
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ city?: string[] }>;
  searchParams: Promise<{ area?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  
  const resolvedParams = await params;
  const citySegments = resolvedParams.city || [];
  const citySlug = citySegments[0] || "";
  const serviceSlug = citySegments[1] || "";
  const extraSegment = citySegments[2];
  const seoLocation = citySlug ? getSeoLocation(citySlug) : undefined;
  const seoService = serviceSlug ? getSeoService(serviceSlug) : undefined;
  const rootKeyword = !serviceSlug && citySlug ? getKeywordPage(citySlug) : undefined;
  const nestedKeyword =
    serviceSlug && seoLocation ? getKeywordPage(serviceSlug) : undefined;
  const keywordPage =
    rootKeyword ||
    (nestedKeyword && keywordFitsLocation(nestedKeyword, citySlug) ? nestedKeyword : undefined);

  if (citySlug && !seoLocation && !rootKeyword) {
    return {
      title: absoluteTitle("Page not found | OMAA Company"),
      robots: { index: false, follow: false },
    };
  }

  if (extraSegment) {
    return {
      title: absoluteTitle("Page not found | OMAA Company"),
      robots: { index: false, follow: false },
    };
  }

  if (keywordPage) {
    const place = seoLocation?.title || "Noida";
    const heading = keywordHeading(keywordPage, place);
    const canonical = nestedKeyword
      ? `${siteUrl}/${citySlug}/${keywordPage.slug}`
      : `${siteUrl}/${keywordPage.slug}`;
    return {
      title: absoluteTitle(`${heading} | Call 9999251966`),
      description: nestedKeyword
        ? `${keywordPage.title} in ${place}. Same-day doorstep technician. Call 9999251966.`
        : keywordPage.description,
      keywords: [keywordPage.title, place, "Delhi NCR", "OMAA Company"],
      alternates: { canonical },
      openGraph: {
        title: heading,
        description: keywordPage.description,
        url: canonical,
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: heading }],
      },
    };
  }

  if (citySlug && (extraSegment || (serviceSlug && !seoService))) {
    return {
      title: absoluteTitle("Page not found | OMAA Company"),
      robots: { index: false, follow: false },
    };
  }

  if (!citySlug) {
    // Root Homepage SEO
    return {
      title: absoluteTitle("Home Appliance Repair Noida | Washing Machine, Refrigerator & RO Repair Near Me"),
      description:
        "Washing machine repair near me, refrigerator repair near me, RO repair near me and home appliance repair Noida. Same-day technician at your doorstep. Call 9999251966.",
      keywords: [
        "Washing Machine Repair Near Me",
        "Refrigerator Repair Near Me",
        "RO Repair Near Me",
        "Washing Machine Repair Noida",
        "Refrigerator Repair Noida",
        "RO Repair Noida",
        "Fridge Repair Near Me",
        "Water Purifier Repair Near Me",
        "Home Appliance Repair Noida",
      ],
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

  const locationTitle = seoLocation?.title || citySlug;
  const pagePath = seoService ? `/${citySlug}/${seoService.slug}` : `/${citySlug}`;

  if (seoService && seoLocation) {
    const isNoida = citySlug === "noida";
    const pageTitle = isNoida
      ? `${seoService.titleKeyword} Noida | ${seoService.shortName} Near Me`
      : `${seoService.titleKeyword} in ${locationTitle} | Near Me`;
    return {
      title: absoluteTitle(pageTitle),
      description: seoService.description(locationTitle),
      keywords: [
        `${seoService.titleKeyword} ${locationTitle}`,
        `${seoService.shortName} near me`,
        `${seoService.shortName} Noida`,
      ],
      alternates: { canonical: `${siteUrl}${pagePath}` },
      openGraph: {
        title: `${seoService.titleKeyword} in ${locationTitle} | OMAA Company`,
        description: seoService.description(locationTitle),
        url: `${siteUrl}${pagePath}`,
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${seoService.shortName} in ${locationTitle}` }],
      },
    };
  }

  // Hyper-optimized SEO specific for Gaur City 2 target keywords
  if (citySlug.startsWith("gaur-city-2")) {
    return {
      title: absoluteTitle(`RO, Refrigerator & Washing Machine Repair in ${locationTitle} | Call 9999251966`),
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
    title: absoluteTitle(
      citySlug === "noida"
        ? "Home Appliance Repair Noida | RO Repair, Fridge Repair & Washing Machine Repair"
        : `Appliance Repair in ${locationTitle} | RO, Refrigerator, Washing Machine Near Me`
    ),
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

export default async function Home({ params }: PageProps) {
  const resolvedParams = await params;
  const citySegments = resolvedParams.city || [];
  const citySlug = citySegments[0] || "";
  const serviceSlug = citySegments[1] || "";
  const extraSegment = citySegments[2];
  const seoLocation = citySlug ? getSeoLocation(citySlug) : undefined;
  const seoService = serviceSlug ? getSeoService(serviceSlug) : undefined;
  const rootKeyword = !serviceSlug && citySlug ? getKeywordPage(citySlug) : undefined;
  const nestedKeyword =
    serviceSlug && seoLocation ? getKeywordPage(serviceSlug) : undefined;
  const keywordPage =
    rootKeyword ||
    (nestedKeyword && keywordFitsLocation(nestedKeyword, citySlug) ? nestedKeyword : undefined);

  if (citySlug && !seoLocation && !rootKeyword) {
    notFound();
  }
  if (extraSegment || (serviceSlug && !seoService && !keywordPage)) {
    notFound();
  }

  const homeSiteUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com").replace(/\/$/, "");

  if (keywordPage) {
    const location = seoLocation || getSeoLocation(keywordPage.locationSlug);
    if (!location) notFound();
    const service = keywordService(keywordPage);
    const heading = keywordHeading(keywordPage, location.title);
    const pageUrl = nestedKeyword
      ? `${homeSiteUrl}/${location.slug}/${keywordPage.slug}`
      : `${homeSiteUrl}/${keywordPage.slug}`;
    const landingSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: homeSiteUrl },
            { "@type": "ListItem", position: 2, name: heading, item: pageUrl },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: (service ? service.faqs(location.title) : location.faqs).map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        },
      ],
    };

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(landingSchema) }}
        />
        <Navbar />
        <LocationSeoSection location={location} service={service} heading={heading} />
        <Footer />
      </main>
    );
  }

  if (seoLocation && seoService) {
    const locationUrl = `${homeSiteUrl}/${seoLocation.slug}/${seoService.slug}`;
    const landingSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: homeSiteUrl },
            { "@type": "ListItem", position: 2, name: seoLocation.title, item: `${homeSiteUrl}/${seoLocation.slug}` },
            { "@type": "ListItem", position: 3, name: seoService.shortName, item: locationUrl },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: seoService.faqs(seoLocation.title).map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        },
      ],
    };

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(landingSchema) }}
        />
        <Navbar />
        <LocationSeoSection location={seoLocation} service={seoService} />
        <Footer />
      </main>
    );
  }

  let categories: any[] = [];
  let desktopBanners: any[] = [];
  let mobileBanners: any[] = [];

  try {
    const [
      bResult,
      catResult,
      servicesResult,
      desktopResult,
      mobileResult
    ] = await Promise.allSettled([
      pool.query("SELECT category, services, rating FROM bookings WHERE rating IS NOT NULL AND rating > 0 ORDER BY created_at DESC LIMIT 400"),
      pool.query("SELECT * FROM categories WHERE status = 'Active'"),
      pool.query("SELECT * FROM services"),
      pool.query("SELECT * FROM banners WHERE type = 'desktop' OR type IS NULL ORDER BY created_at DESC LIMIT 1"),
      pool.query("SELECT * FROM banners WHERE type = 'mobile' ORDER BY created_at DESC LIMIT 1")
    ]);

    let bookingRatings: any[] = [];
    if (bResult.status === "fulfilled") {
      const [bRows]: any = bResult.value;
      bookingRatings = bRows || [];
    }

    let catRows: any[] = [];
    if (catResult.status === "fulfilled") {
      const [rows]: any = catResult.value;
      catRows = rows || [];
    }

    let allServices: any[] = [];
    if (servicesResult.status === "fulfilled") {
      const [rows]: any = servicesResult.value;
      allServices = rows || [];
    }

    categories = catRows.map((cat: any) => {
      const services = allServices.filter((s: any) => s.category_id === cat.id);

      const enhancedServices = services.map((srv: any) => {
        const matching = bookingRatings.filter((b) => {
          const matchesCategory = b.category && cat.title && b.category.toLowerCase().includes(cat.title.toLowerCase());
          let matchesService = false;
          try {
            if (b.services) {
              const srvStr = typeof b.services === "string" ? b.services : JSON.stringify(b.services);
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

    if (desktopResult.status === "fulfilled") {
      const [desktopRows]: any = desktopResult.value;
      if (desktopRows && desktopRows.length > 0) {
        const row = desktopRows[0];
        if (row.banner1_url) desktopBanners.push(row.banner1_url);
        if (row.banner2_url) desktopBanners.push(row.banner2_url);
        if (row.banner3_url) desktopBanners.push(row.banner3_url);
      }
    }

    if (mobileResult.status === "fulfilled") {
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

  const homepageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeSiteUrl}/#website`,
        url: homeSiteUrl,
        name: "OMAA Company",
        description: "Doorstep Appliance Repair and Maintenance Services",
      },
      {
        "@type": "ItemList",
        "@id": `${homeSiteUrl}#services-list`,
        name: "Doorstep Appliance Repair Services",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "RO Repair and Service",
            url: `${homeSiteUrl}/services/5`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Refrigerator Repair",
            url: `${homeSiteUrl}/services/2`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Washing Machines Repair",
            url: `${homeSiteUrl}/services/3`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Navbar />
      {seoLocation ? <LocationSeoSection location={seoLocation} /> : null}
      <Hero
        categories={categories}
        banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners}
      />
      <NewProductsSection />
      <HomeCategoryStream
        initialCategories={categories}
        banners={desktopBanners}
      />
      <Footer />
    </main>
  );
}
