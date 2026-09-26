import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pool from "../../lib/db";
import {
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Droplet,
  Refrigerator,
  Sparkles,
  HelpCircle,
  PhoneCall,
  ChevronRight
} from "lucide-react";

export const revalidate = 120;

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
const siteUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const metadata: Metadata = {
  title: "Doorstep Appliance Repair Services | RO, Refrigerator & Washing Machine | OMAA Company",
  description:
    "Explore OMAA Company's complete doorstep appliance repair services: RO water purifier repair & AMC, refrigerator troubleshooting, washing machine maintenance, and AC repair in Delhi NCR with 30-day warranty.",
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: "Appliance Repair Services | RO, Refrigerator & Washing Machine - OMAA Company",
    description:
      "Certified doorstep repair for RO water purifiers, refrigerators, washing machines, and ACs. Transparent rate card, genuine spare parts, and 30-day warranty.",
    url: `${siteUrl}/services`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OMAA Company Doorstep Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doorstep Appliance Repair Services | OMAA Company",
    description:
      "Expert doorstep repair for RO, refrigerators, and washing machines in Delhi NCR with 30-day warranty.",
    images: ["/og-image.jpg"],
  },
};

export default async function ServicesPage() {
  let categories: any[] = [];

  try {
    const [catRows]: any = await pool.query(
      "SELECT id, title, type FROM categories WHERE status = 'Active' ORDER BY id ASC"
    );

    categories = await Promise.all(
      (catRows || []).map(async (cat: any) => {
        const [services]: any = await pool.query(
          "SELECT id, title, original_price, selling_price, rating FROM services WHERE category_id = ?",
          [cat.id]
        );
        return {
          ...cat,
          services: services || [],
        };
      })
    );
  } catch (error) {
    console.error("Error fetching categories for /services:", error);
  }

  // Find featured categories for targeted spotlights
  const roCategory = categories.find(
    (c) => c.id === 5 || c.title.toLowerCase().includes("water purifier") || c.title.toLowerCase().includes("ro")
  );
  const roAmcCategory = categories.find(
    (c) => c.id === 7 || c.title.toLowerCase().includes("ro amc")
  );
  const fridgeCategory = categories.find(
    (c) => c.id === 2 || c.title.toLowerCase().includes("refrigerator")
  );
  const washingCategory = categories.find(
    (c) => c.id === 3 || c.title.toLowerCase().includes("washing machine")
  );

  const faqs = [
    {
      q: "How soon can a technician arrive for RO, Refrigerator, or Washing Machine repair?",
      a: "Our certified technicians can reach your doorstep within 60 to 90 minutes across Noida, Greater Noida, Ghaziabad, Delhi, and Gurgaon, or at a scheduled time of your preference.",
    },
    {
      q: "What is included in OMAA Company's 30-Day Service Warranty?",
      a: "Every repair job completed by OMAA Company includes a 30-day service warranty. If the same issue recurs within 30 days of the repair, our technician will inspect and resolve it free of charge.",
    },
    {
      q: "Do you use genuine spare parts for RO, Fridge, and Washing Machines?",
      a: "Yes. All replacement parts—such as RO membranes, carbon filters, refrigerator thermostats, compressors, washing machine drain pumps, and PCB units—are 100% genuine and covered under respective warranty periods.",
    },
    {
      q: "What are the check-up charges if I do not proceed with the repair?",
      a: "We maintain complete transparency. Basic diagnostic and inspection charges start at only ₹160 for Water Purifiers and ₹199 for Refrigerators & Washing Machines. If you approve the repair, the inspection fee is adjusted against the final bill.",
    },
    {
      q: "Can I buy an Annual Maintenance Contract (RO AMC) for my water purifier?",
      a: "Yes, we offer comprehensive RO AMC plans starting at ₹4,000 covering all major brands including Kent, Aquafresh, Livpure, Pureit, and Aqua Grand, including scheduled filter changes and unlimited breakdowns.",
    },
  ];

  const servicesSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": `${siteUrl}/services`
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Home Appliance Repair Categories",
        "itemListElement": [
          {
            "@type": "Service",
            "position": 1,
            "name": "RO Repair and Service",
            "url": `${siteUrl}/services/5`,
            "description": "Comprehensive doorstep water purifier and RO servicing, filter replacement, TDS calibration, and annual maintenance contracts (AMC).",
            "provider": { "@type": "LocalBusiness", "name": "OMAA Company" }
          },
          {
            "@type": "Service",
            "position": 2,
            "name": "Refrigerator Repair",
            "url": `${siteUrl}/services/2`,
            "description": "Expert repair for single-door, double-door, and inverter refrigerators. Power issue, cooling problems, water leakage, and compressor troubleshooting.",
            "provider": { "@type": "LocalBusiness", "name": "OMAA Company" }
          },
          {
            "@type": "Service",
            "position": 3,
            "name": "Washing Machines Repair",
            "url": `${siteUrl}/services/3`,
            "description": "Doorstep repair & jet cleaning for top-load, front-load, and semi-automatic washing machines with genuine parts and a 30-day warranty.",
            "provider": { "@type": "LocalBusiness", "name": "OMAA Company" }
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <Navbar />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-indigo-200 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Doorstep Home Appliance Care in Delhi NCR
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Appliance Repair &amp; Maintenance Services
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-indigo-100/90 leading-relaxed mb-8">
            Expert repair solutions for <strong>RO Water Purifiers</strong>, <strong>Refrigerators</strong>, <strong>Washing Machines</strong>, and <strong>Air Conditioners</strong>. Genuine spare parts, certified technicians, and upfront pricing.
          </p>

          {/* Quick Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-200">Warranty</p>
                <p className="text-sm font-bold text-white">30-Day Service Guarantee</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3">
              <Clock className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-200">Speed</p>
                <p className="text-sm font-bold text-white">60-Min Doorstep Arrival</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-300 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-200">Quality</p>
                <p className="text-sm font-bold text-white">Genuine Spare Parts</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-purple-300 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-200">Rating</p>
                <p className="text-sm font-bold text-white">4.8★ (50,000+ Happy Homes)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">

        {/* SECTION 1: High Priority Focus Categories Spotlight */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Appliance Care Categories
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Specialized doorstep service teams ready for your everyday home appliances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. RO Repair and Service */}
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-6 text-white relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                  <Droplet className="w-7 h-7 text-white" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
                  Pure Water Assurance
                </span>
                <h3 className="text-2xl font-bold">RO Repair &amp; Service</h3>
                <p className="text-sky-100 text-sm mt-1">Water Purifier Diagnostics, Filter Change &amp; AMC</p>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Filter &amp; Membrane:</strong> Sediment, Carbon &amp; 80 GPD RO Membrane replacement.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span><strong>TDS &amp; Taste Adjustment:</strong> Optimal mineral balance &amp; UV/UF sanitization.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Pump &amp; Leakage Repair:</strong> Booster pump fixing, SMPS power unit replacement.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Annual AMC Plans:</strong> Unlimited breakdown visits &amp; scheduled services.</span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-gray-100 pt-4 mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">Inspection Starts At</span>
                      <span className="text-2xl font-extrabold text-sky-700">₹160</span>
                    </div>
                    <span className="text-xs bg-sky-50 text-sky-700 font-semibold px-2 py-1 rounded-md border border-sky-200">
                      All Brands Supported
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={roCategory ? `/services/${roCategory.id}` : "/services/5"}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      RO Repair <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={roAmcCategory ? `/services/${roAmcCategory.id}` : "/services/7"}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-sm font-semibold border border-sky-200 transition"
                    >
                      RO AMC Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Refrigerator Repair */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                  <Refrigerator className="w-7 h-7 text-white" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
                  Cooling Restored
                </span>
                <h3 className="text-2xl font-bold">Refrigerator Repair</h3>
                <p className="text-indigo-100 text-sm mt-1">Single, Double Door, Side-by-Side &amp; Inverter</p>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Cooling Problems:</strong> Less cooling, no cooling, or excess freeze resolved.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Compressor &amp; Gas Refill:</strong> Genuine refrigerant gas charging &amp; relay fixes.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Electrical &amp; Noise Issues:</strong> Thermostat, defrost timer &amp; fan motor service.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Door &amp; Leakage Issues:</strong> Gasket replacement, drain tube cleaning &amp; fixes.</span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-gray-100 pt-4 mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">Check-Up Starts At</span>
                      <span className="text-2xl font-extrabold text-indigo-700">₹199</span>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-1 rounded-md border border-indigo-200">
                      30-Day Warranty
                    </span>
                  </div>

                  <Link
                    href={fridgeCategory ? `/services/${fridgeCategory.id}` : "/services/2"}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Explore Refrigerator Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Washing Machine Repair */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 text-white relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
                  Gentle &amp; Powerful Care
                </span>
                <h3 className="text-2xl font-bold">Washing Machines</h3>
                <p className="text-purple-100 text-sm mt-1">Automatic Front/Top Load &amp; Semi-Automatic</p>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Deep Jet Service:</strong> High-pressure scale &amp; tub clean for fresh laundry.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Drum &amp; Spinning Issues:</strong> Drum bearing, belt replacement &amp; spin motor fixes.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Drainage &amp; Inlet:</strong> Water not draining, inlet valve blockage &amp; pipe repairs.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>PCB Motherboard:</strong> Error code diagnosis &amp; electronic module repair.</span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-gray-100 pt-4 mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">Check-Up Starts At</span>
                      <span className="text-2xl font-extrabold text-purple-700">₹199</span>
                    </div>
                    <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-1 rounded-md border border-purple-200">
                      Jet Service ₹699
                    </span>
                  </div>

                  <Link
                    href={washingCategory ? `/services/${washingCategory.id}` : "/services/3"}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Explore Washing Machine Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: All Available Categories Directory */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Service Categories</h2>
              <p className="text-gray-600 text-sm mt-1">
                Choose your appliance category for detailed rate cards and doorstep booking.
              </p>
            </div>
            <span className="text-sm font-medium text-gray-500 mt-2 sm:mt-0">
              {categories.length} Categories Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const count = cat.services ? cat.services.length : 0;
              const minPrice = cat.services && cat.services.length > 0
                ? Math.min(...cat.services.map((s: any) => parseFloat(s.selling_price || "0")).filter((p: number) => p > 0))
                : 199;

              return (
                <Link
                  key={cat.id}
                  href={`/services/${cat.id}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 transition-colors flex items-center justify-center">
                        <Award className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        30-Day Warranty
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                      Professional repair, scheduled maintenance &amp; genuine part replacements.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block">{count} Services</span>
                      <span className="font-bold text-gray-900">Starts ₹{minPrice}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                      View Services <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Why Choose Us Guarantee Strip */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-10 mb-16 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Why Delhi NCR Trusts OMAA Company</h2>
            <p className="text-gray-600 text-sm mt-1">
              Transparent, accountable, and customer-first doorstep home appliance repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">30-Day Re-visit Guarantee</h4>
              <p className="text-xs text-gray-500">Free revisits if the same problem happens again within 30 days.</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Standard Rate Card</h4>
              <p className="text-xs text-gray-500">Every price is published in advance with no sudden technician markups.</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Same-Day Slot Booking</h4>
              <p className="text-xs text-gray-500">Flexible 2-hour delivery windows tailored around your schedule.</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Verified Technicians</h4>
              <p className="text-xs text-gray-500">Background-verified professionals with strict service standards.</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: FAQs */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm mt-1">Everything you need to know about our appliance repair process.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-indigo-600 font-extrabold">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: Contact & Quick Call CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-indigo-400 text-xs uppercase font-bold tracking-widest block mb-2">
              Need Instant Assistance?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Have a breakdown at home?</h3>
            <p className="text-gray-300 text-sm sm:text-base mt-1 max-w-xl">
              Talk directly with our service dispatch desk in Gaur City 2, Noida Extension for fast same-day booking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href="tel:+919999251966"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              <PhoneCall className="w-4 h-4" /> Call +91 9999251966
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
