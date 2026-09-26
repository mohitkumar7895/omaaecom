import type { Metadata } from "next";
import "./globals.css";
import GlobalLoader from "./components/GlobalLoader";
import OfferMarqueeHost from "./components/OfferMarqueeHost";
import RatingReviewModal from "./components/RatingReviewModal";
import NavigationProgress from "./components/NavigationProgress";

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "OMAA Company - Doorstep Appliance Repair & Maintenance Experts",
  description:
    "Book certified doorstep repair & maintenance for RO water purifiers, refrigerators, washing machines, and ACs with OMAA Company. 30-day warranty, transparent pricing & verified experts across Delhi NCR.",
  keywords: [
    "Washing Machine Repair Near Me",
    "Refrigerator Repair Near Me",
    "RO Repair Near Me",
    "Washing Machine Repair Noida",
    "Refrigerator Repair Noida",
    "RO Repair Noida",
    "Washing Machine Service Near Me",
    "Refrigerator Service Near Me",
    "RO Service Near Me",
    "Fridge Repair Near Me",
    "Water Purifier Repair Near Me",
    "Washing Machine Technician Near Me",
    "Refrigerator Technician Near Me",
    "RO Technician Near Me",
    "Home Appliance Repair Noida",
    "OMAA Company",
  ],
  authors: [{ name: "OMAA Company", url: siteUrl }],
  creator: "OMAA Company",
  publisher: "OMAA Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "OMAA Company",
    title: "OMAA Company - Doorstep Appliance Repair & Maintenance Experts",
    description:
      "Certified doorstep repair for RO purifiers, refrigerators, washing machines & ACs in Delhi NCR. 30-day warranty & upfront honest pricing.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OMAA Company - Doorstep Appliance Repair Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OMAA Company - Doorstep Appliance Repair & Maintenance",
    description:
      "Certified doorstep repair for RO purifiers, refrigerators, washing machines & ACs in Delhi NCR with 30-day warranty.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "6chr3KOkEHLF43tQxoATLMWdqqMjuPAQYsldOANyayQ",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${siteUrl}/#business`,
    name: "OMAA Company",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    description:
      "Reliable doorstep home appliance repair services specializing in RO water purifiers, refrigerators, washing machines, and ACs.",
    telephone: "+919999251966",
    email: "support@omaacompany.com",
    priceRange: "₹160 - ₹4000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot No.197, Office No.2, Gaur City - 2 (Opp. Mahagun My Wood)",
      addressLocality: "Noida Extension, Greater Noida West",
      addressRegion: "Uttar Pradesh",
      postalCode: "201009",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "28.6087",
      longitude: "77.4265",
    },
    areaServed: [
      { "@type": "City", name: "Delhi" },
      { "@type": "City", name: "Noida" },
      { "@type": "City", name: "Greater Noida" },
      { "@type": "City", name: "Ghaziabad" },
      { "@type": "City", name: "Gurgaon" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    sameAs: ["https://www.omaacompany.com"],
  };

  return (
    <html lang="en" className="font-sans h-full antialiased">
      <head>
        <meta name="google-site-verification" content="6chr3KOkEHLF43tQxoATLMWdqqMjuPAQYsldOANyayQ" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-gray-900">
        <NavigationProgress />
        <GlobalLoader />
        <RatingReviewModal />
        <OfferMarqueeHost />
        {children}
      </body>
    </html>
  );
}
