import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SEO_LOCATIONS } from "../../lib/seo-locations";
import { SEO_SERVICES } from "../../lib/seo-services";
import { SEO_KEYWORD_PAGES, keywordFitsLocation } from "../../lib/seo-keywords";
import { GAUR_CITY_SOCIETIES } from "../../lib/gaur-city-data";
import { getSiteUrl } from "../../lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Sitemap Service | Appliance Repair Cities & Societies",
  description:
    "All OMAA Company service cities and societies: RO repair, refrigerator repair and washing machine repair in Noida, Gaur City 2, White Orchid, Flora, Mahagun Mywoods and more.",
  alternates: { canonical: `${siteUrl}/service-areas` },
};

export default function ServiceAreasPage() {
  const cities = SEO_LOCATIONS.filter((loc) => loc.kind !== "society");
  const societies = SEO_LOCATIONS.filter((loc) => loc.kind === "society");

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <nav className="text-xs sm:text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#5c67b8] font-medium">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-800 font-semibold">Sitemap Service</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Sitemap Service
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Search keywords, cities and societies. Click any keyword to open its repair page.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Search keywords</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <ul className="flex flex-wrap gap-2">
              {SEO_KEYWORD_PAGES.map((kw) => (
                <li key={kw.slug}>
                  <Link
                    href={`/${kw.slug}`}
                    className="inline-block text-[11px] sm:text-xs font-semibold bg-[#eef1fc] text-[#5c67b8] px-2.5 py-1.5 rounded-full hover:bg-[#5c67b8] hover:text-white"
                  >
                    {kw.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <LocationGroup title="Cities" locations={cities} />
        
        {/* Gaur City 2 Hub & Core Avenues */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-gray-900">
              Gaur City 2 & Sector 16C Societies
            </h2>
            <Link
              href="/gaur-city-2"
              className="text-xs font-bold text-[#5c67b8] hover:underline"
            >
              Visit Gaur City 2 Hub &rarr;
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {GAUR_CITY_SOCIETIES.map((soc) => (
              <div key={soc.slug} className="px-4 sm:px-6 py-4 hover:bg-indigo-50/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Link href={`/gaur-city-2/${soc.slug}`} className="font-bold text-gray-900 hover:text-[#5c67b8] text-base">
                    {soc.name}
                  </Link>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${soc.isCore ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {soc.isCore ? "Core Gaur City 2" : "Nearby Society"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{soc.localityLabel}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Link
                    href={`/gaur-city-2/${soc.slug}/ro-water-purifier-service`}
                    className="text-[11px] font-semibold bg-[#eef1fc] text-[#5c67b8] px-2.5 py-1 rounded-full hover:bg-[#5c67b8] hover:text-white"
                  >
                    RO Service
                  </Link>
                  <Link
                    href={`/gaur-city-2/${soc.slug}/ac-repair-service`}
                    className="text-[11px] font-semibold bg-[#eef1fc] text-[#5c67b8] px-2.5 py-1 rounded-full hover:bg-[#5c67b8] hover:text-white"
                  >
                    AC Repair
                  </Link>
                  <Link
                    href={`/gaur-city-2/${soc.slug}/washing-machine-repair`}
                    className="text-[11px] font-semibold bg-[#eef1fc] text-[#5c67b8] px-2.5 py-1 rounded-full hover:bg-[#5c67b8] hover:text-white"
                  >
                    Washing Machine
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <LocationGroup title="Other Delhi NCR Societies" locations={societies} />
      </div>
      <Footer />
    </main>
  );
}

function LocationGroup({
  title,
  locations,
}: {
  title: string;
  locations: typeof SEO_LOCATIONS;
}) {
  if (locations.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold text-gray-900 mb-3">{title}</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {locations.map((loc) => (
          <div key={loc.slug} className="px-4 sm:px-6 py-4 hover:bg-indigo-50/40 transition-colors">
            <Link href={`/${loc.slug}`} className="block group">
              <p className="font-bold text-gray-900 group-hover:text-[#5c67b8] text-base">
                {loc.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{loc.region}</p>
            </Link>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SEO_SERVICES.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/${loc.slug}/${svc.slug}`}
                  className="text-[11px] sm:text-xs font-semibold bg-[#eef1fc] text-[#5c67b8] px-2.5 py-1 rounded-full hover:bg-[#5c67b8] hover:text-white"
                >
                  {svc.shortName}
                </Link>
              ))}
              {SEO_KEYWORD_PAGES.filter((kw) => keywordFitsLocation(kw, loc.slug)).map((kw) => (
                <Link
                  key={kw.slug}
                  href={`/${loc.slug}/${kw.slug}`}
                  className="text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full hover:bg-[#5c67b8] hover:text-white"
                >
                  {kw.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
