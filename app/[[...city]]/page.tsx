import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import NewProductsSection from "../components/NewProductsSection";
import HomeCategoryStream from "../components/HomeCategoryStream";
import Footer from "../components/Footer";
import { absoluteTitle, getSeoLocation } from "../../lib/seo-locations";
import { getSeoService } from "../../lib/seo-services";
import {
  getKeywordPage,
  keywordFitsLocation,
  keywordHeading,
  keywordService,
} from "../../lib/seo-keywords";
import LocationSeoSection from "../components/LocationSeoSection";
import GaurCitySeoLanding from "../components/GaurCitySeoLanding";
import { getHomeCatalog } from "../../lib/home-catalog";
import { getSiteUrl } from "../../lib/site-url";
import pool from "../../lib/db";
import {
  getGaurCitySociety,
  getGaurCityService,
  getGaurCityPageSeo,
  GAUR_CITY_GENERAL_FAQS,
} from "../../lib/gaur-city-data";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCustomSitemapPage(segments: string[]) {
  if (!segments || segments.length === 0) return null;
  const pathWithSlash = "/" + segments.join("/");
  const pathWithoutSlash = segments.join("/");
  
  // Cross-compatibility: support both /sitemap/keyword and /keyword in database
  const alternatePath = segments[0] === "sitemap" && segments.length > 1
    ? "/" + segments.slice(1).join("/")
    : "/sitemap" + pathWithSlash;

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM sitemap_links 
       WHERE (url = ? OR url = ? OR url = ? OR url LIKE ? OR url = ?) 
       AND is_active = TRUE 
       ORDER BY priority DESC, id DESC 
       LIMIT 1`,
      [pathWithSlash, pathWithoutSlash, alternatePath, `${pathWithSlash}%`, pathWithSlash.replace(/^\//, "")]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error("Error querying custom sitemap page:", err);
  }
  return null;
}

type PageProps = {
  params: Promise<{ city?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  
  const resolvedParams = await params;
  const citySegments = resolvedParams.city || [];
  const citySlug = citySegments[0] || "";
  const serviceSlug = citySegments[1] || "";
  const extraSegment = citySegments[2];

  // 1. Check if this route matches an admin-created custom sitemap link (e.g. /sitemap/keyword or /keyword)
  if (citySegments.length > 0) {
    const customPage = await getCustomSitemapPage(citySegments);
    if (customPage) {
      const pageTitle = customPage.heading || customPage.title;
      const pageDesc =
        customPage.meta_description ||
        customPage.subheading ||
        customPage.content ||
        `Verified doorstep home appliance repair in ${customPage.area || customPage.city || "Delhi NCR"}. Call 9999251966 for 30-day warranty & instant service.`;
      const canonical = `${siteUrl}/${citySegments.join("/")}`;
      const isIndexable = Boolean(customPage.is_indexable);

      return {
        title: absoluteTitle(`${pageTitle} | Call 9999251966`),
        description: pageDesc,
        keywords: [pageTitle, customPage.area || "", customPage.city || "", "OMAA Company"].filter(Boolean),
        alternates: { canonical },
        robots: isIndexable
          ? { index: true, follow: true }
          : {
              index: false,
              follow: false,
              googleBot: {
                index: false,
                follow: false,
                noimageindex: true,
              },
            },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: canonical,
          images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: pageTitle }],
        },
        twitter: {
          card: "summary_large_image",
          title: pageTitle,
          description: pageDesc,
          images: ["/og-image.jpg"],
        },
      };
    }
  }

  if (citySlug === "sitemap.xml" || citySlug === "robots.txt" || (citySlug === "sitemap" && citySegments.length === 1)) {
    return { robots: { index: false, follow: false } };
  }

  // Handle Gaur City 2 Hub and nested society/service routes
  if (citySlug === "gaur-city-2") {
    if (citySegments.length > 3) {
      return {
        title: absoluteTitle("Page not found | OMAA Company"),
        robots: { index: false, follow: false },
      };
    }

    const societySlug = citySegments[1];
    const targetServiceSlug = citySegments[2];
    const society = societySlug ? getGaurCitySociety(societySlug) : undefined;
    const gaurService = targetServiceSlug ? getGaurCityService(targetServiceSlug) : undefined;

    if (societySlug && !society) {
      return {
        title: absoluteTitle("Page not found | OMAA Company"),
        robots: { index: false, follow: false },
      };
    }
    if (targetServiceSlug && !gaurService) {
      return {
        title: absoluteTitle("Page not found | OMAA Company"),
        robots: { index: false, follow: false },
      };
    }

    const seo = getGaurCityPageSeo(society?.slug, gaurService?.slug);
    const pagePath = gaurService
      ? `/gaur-city-2/${society?.slug}/${gaurService.slug}`
      : society
      ? `/gaur-city-2/${society.slug}`
      : `/gaur-city-2`;
    const canonical = `${siteUrl}${pagePath}`;

    return {
      title: absoluteTitle(seo.title),
      description: seo.description,
      keywords: seo.keywords,
      alternates: { canonical },
      openGraph: {
        title: seo.title,
        description: seo.description,
        url: canonical,
        images: [
          {
            url: "/og-image.jpg",
            width: 1200,
            height: 630,
            alt: seo.h1,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: seo.title,
        description: seo.description,
        images: ["/og-image.jpg"],
      },
    };
  }

  const seoLocation = citySlug ? getSeoLocation(citySlug) : undefined;
  const seoService = serviceSlug ? getSeoService(serviceSlug) : undefined;
  const rootKeyword = !serviceSlug && citySlug ? getKeywordPage(citySlug) : undefined;
  const nestedKeyword =
    serviceSlug && seoLocation ? getKeywordPage(serviceSlug) : undefined;
  const keywordPage =
    rootKeyword ||
    (nestedKeyword && keywordFitsLocation(nestedKeyword, citySlug) ? nestedKeyword : undefined);

  // Check if this route matches an admin-created custom sitemap link
  if (citySegments.length > 0) {
    const customPage = await getCustomSitemapPage(citySegments);
    if (customPage) {
      const pageTitle = customPage.heading || customPage.title;
      const pageDesc =
        customPage.meta_description ||
        customPage.subheading ||
        customPage.content ||
        `Verified doorstep home appliance repair in ${customPage.area || customPage.city || "Delhi NCR"}. Call 9999251966 for 30-day warranty & instant service.`;
      const canonical = `${siteUrl}/${citySegments.join("/")}`;
      const isIndexable = Boolean(customPage.is_indexable);

      return {
        title: absoluteTitle(`${pageTitle} | Call 9999251966`),
        description: pageDesc,
        keywords: [pageTitle, customPage.area || "", customPage.city || "", "OMAA Company"].filter(Boolean),
        alternates: { canonical },
        robots: isIndexable
          ? { index: true, follow: true }
          : {
              index: false,
              follow: false,
              googleBot: {
                index: false,
                follow: false,
                noimageindex: true,
              },
            },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: canonical,
          images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: pageTitle }],
        },
        twitter: {
          card: "summary_large_image",
          title: pageTitle,
          description: pageDesc,
          images: ["/og-image.jpg"],
        },
      };
    }
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

  const homeSiteUrl = getSiteUrl();

  let categories: any[] = [];
  let desktopBanners: any[] = [];
  let mobileBanners: any[] = [];

  try {
    const catalog = await getHomeCatalog();
    categories = catalog.categories;
    desktopBanners = catalog.desktopBanners;
    mobileBanners = catalog.mobileBanners;
  } catch (error) {
    console.error("Database connection error on Home page:", error);
  }

  // 1. Check if this route matches an admin-created custom sitemap link (e.g. /sitemap/keyword)
  if (citySegments.length > 0) {
    const customPage = await getCustomSitemapPage(citySegments);
    if (customPage) {
      const pageTitle = customPage.heading || customPage.title;
      const canonicalUrl = `${homeSiteUrl}/${citySegments.join("/")}`;
      const targetLocation =
        [customPage.area, customPage.city].filter(Boolean).join(", ") ||
        customPage.city ||
        customPage.area ||
        "Noida";

      const customSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: homeSiteUrl },
              { "@type": "ListItem", position: 2, name: "Service Directory", item: `${homeSiteUrl}/sitemap-directory` },
              { "@type": "ListItem", position: 3, name: pageTitle, item: canonicalUrl },
            ],
          },
          {
            "@type": "HomeAndConstructionBusiness",
            "@id": `${canonicalUrl}#business`,
            name: `OMAA Company - ${pageTitle}`,
            url: canonicalUrl,
            telephone: "+919999251966",
            priceRange: "₹₹",
            image: `${homeSiteUrl}/og-image.jpg`,
            address: {
              "@type": "PostalAddress",
              addressLocality: customPage.area || customPage.city || "Delhi NCR",
              addressRegion: "Uttar Pradesh",
              addressCountry: "IN",
            },
            areaServed: {
              "@type": "AdministrativeArea",
              name: targetLocation,
            },
          },
        ],
      };

      return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema) }}
          />
          <Navbar />
          <Hero
            categories={categories}
            banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners}
            currentCity={targetLocation}
          />
          <NewProductsSection />
          <HomeCategoryStream
            initialCategories={categories}
            banners={desktopBanners}
            currentCity={targetLocation}
          />
          <Footer />
        </main>
      );
    }
  }

  // 2. If just /sitemap (without keyword), redirect to sitemap directory
  if (citySlug === "sitemap" && citySegments.length === 1) {
    redirect("/sitemap-directory");
  }

  if (citySlug === "sitemap.xml" || citySlug === "robots.txt") {
    notFound();
  }

  // Handle Gaur City 2 Hub and nested society/service routes
  if (citySlug === "gaur-city-2") {
    if (citySegments.length > 3) notFound();

    const societySlug = citySegments[1];
    const targetServiceSlug = citySegments[2];
    const society = societySlug ? getGaurCitySociety(societySlug) : undefined;
    const gaurService = targetServiceSlug ? getGaurCityService(targetServiceSlug) : undefined;

    if (societySlug && !society) notFound();
    if (targetServiceSlug && !gaurService) notFound();

    const seo = getGaurCityPageSeo(society?.slug, gaurService?.slug);
    const pagePath = gaurService
      ? `/gaur-city-2/${society?.slug}/${gaurService.slug}`
      : society
      ? `/gaur-city-2/${society.slug}`
      : `/gaur-city-2`;
    const canonicalUrl = `${homeSiteUrl}${pagePath}`;

    const breadcrumbItems: any[] = [
      { "@type": "ListItem", position: 1, name: "Home", item: homeSiteUrl },
      { "@type": "ListItem", position: 2, name: "Gaur City 2", item: `${homeSiteUrl}/gaur-city-2` },
    ];
    if (society) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: society.name,
        item: `${homeSiteUrl}/gaur-city-2/${society.slug}`,
      });
    }
    if (gaurService && society) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 4,
        name: gaurService.name,
        item: canonicalUrl,
      });
    }

    const gaurCitySchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
        {
          "@type": "HomeAndConstructionBusiness",
          "@id": `${canonicalUrl}#business`,
          name: `OMAA Company - ${gaurService ? gaurService.name : "Appliance Repair"} ${society ? society.name : "Gaur City 2"}`,
          url: canonicalUrl,
          telephone: "+919999251966",
          priceRange: "₹₹",
          image: `${homeSiteUrl}/og-image.jpg`,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Greater Noida West",
            addressRegion: "Uttar Pradesh",
            postalCode: "201009",
            streetAddress: society ? `${society.name}, Sector 16C` : "Gaur City 2, Sector 16C",
            addressCountry: "IN",
          },
          areaServed: {
            "@type": "AdministrativeArea",
            name: society ? society.name : "Gaur City 2, Greater Noida West",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: GAUR_CITY_GENERAL_FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        },
      ],
    };

    return (
      <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gaurCitySchema) }}
        />
        <Navbar />
        <GaurCitySeoLanding
          society={society}
          service={gaurService}
          canonicalUrl={canonicalUrl}
        />
        <Footer />
      </main>
    );
  }

  const seoLocation = citySlug ? getSeoLocation(citySlug) : undefined;
  const seoService = serviceSlug ? getSeoService(serviceSlug) : undefined;
  const rootKeyword = !serviceSlug && citySlug ? getKeywordPage(citySlug) : undefined;
  const nestedKeyword =
    serviceSlug && seoLocation ? getKeywordPage(serviceSlug) : undefined;
  const keywordPage =
    rootKeyword ||
    (nestedKeyword && keywordFitsLocation(nestedKeyword, citySlug) ? nestedKeyword : undefined);

  if (extraSegment || (serviceSlug && !seoService && !keywordPage)) {
    notFound();
  }

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
        <Hero
          categories={categories}
          banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners}
          currentCity={location.title}
        />
        <NewProductsSection />
        <HomeCategoryStream
          initialCategories={categories}
          banners={desktopBanners}
          currentCity={location.title}
        />
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
        <Hero
          categories={categories}
          banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners}
          currentCity={seoLocation.title}
        />
        <NewProductsSection />
        <HomeCategoryStream
          initialCategories={categories}
          banners={desktopBanners}
          currentCity={seoLocation.title}
        />
        <Footer />
      </main>
    );
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
        currentCity={seoLocation?.title || (citySlug ? citySlug.replace(/-/g, " ") : undefined)}
      />
      <NewProductsSection />
      <HomeCategoryStream
        initialCategories={categories}
        banners={desktopBanners}
        currentCity={seoLocation?.title || (citySlug ? citySlug.replace(/-/g, " ") : undefined)}
      />
      <Footer />
    </main>
  );
}
