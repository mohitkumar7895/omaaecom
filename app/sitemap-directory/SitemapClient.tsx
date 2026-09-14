"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Wrench,
  Compass,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Home,
  Building2,
  PhoneCall,
  Star,
  Check,
  Filter
} from "lucide-react";

interface SitemapLink {
  id: number;
  title: string;
  url: string;
  group_name: string;
  city?: string | null;
  area?: string | null;
  priority: number;
  changefreq: string;
}

export default function SitemapClient({ initialLinks }: { initialLinks: SitemapLink[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");

  const filteredLinks = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return initialLinks.filter((link) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Services" && link.group_name === "Services") ||
        (activeTab === "Areas" && link.group_name === "Area-wise SEO") ||
        (activeTab === "Main" && link.group_name === "Main Pages") ||
        (activeTab === "Legal" && link.group_name === "Legal & Policies");

      const matchesCity =
        selectedCity === "All" ||
        (link.city && link.city.toLowerCase() === selectedCity.toLowerCase());

      const matchesSearch =
        !term ||
        link.title.toLowerCase().includes(term) ||
        link.url.toLowerCase().includes(term) ||
        (link.city && link.city.toLowerCase().includes(term)) ||
        (link.area && link.area.toLowerCase().includes(term));

      return matchesTab && matchesCity && matchesSearch;
    });
  }, [initialLinks, searchTerm, activeTab, selectedCity]);

  // Groupings
  const servicesLinks = filteredLinks.filter((l) => l.group_name === "Services");
  const areaLinks = filteredLinks.filter((l) => l.group_name === "Area-wise SEO");
  const mainLinks = filteredLinks.filter((l) => l.group_name === "Main Pages");
  const legalLinks = filteredLinks.filter((l) => l.group_name === "Legal & Policies");

  // Get distinct cities from areaLinks
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    initialLinks.forEach((l) => {
      if (l.city) citiesSet.add(l.city);
    });
    return Array.from(citiesSet);
  }, [initialLinks]);

  // Group Area links by City
  const areasByCity = useMemo(() => {
    const map: Record<string, SitemapLink[]> = {};
    areaLinks.forEach((l) => {
      const city = l.city || "Delhi NCR & Other Areas";
      if (!map[city]) map[city] = [];
      map[city].push(l);
    });
    return map;
  }, [areaLinks]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Rich Responsive Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#111936] via-[#1a2552] to-[#253270] text-white pt-8 pb-10 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/20 shadow-2xl">
        {/* Glowing gradient circles */}
        <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs font-medium text-indigo-200/70">
            <Link href="/" className="hover:text-white transition flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-indigo-300/50" />
            <span className="text-white font-semibold truncate">Site Directory & Sitemap</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/15 shadow-inner">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Local Service Directory</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                OMAA Company <span className="bg-gradient-to-r from-blue-200 via-indigo-200 to-amber-200 bg-clip-text text-transparent">Site Directory</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
                Explore complete doorstep home appliance repair, maintenance, and AMC services across Noida, Greater Noida, Ghaziabad, Delhi NCR, and Gurgaon. Find your local sector or locality for instant technician dispatch.
              </p>

              {/* Live Search Bar & XML Link */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search service or locality (e.g. AC Repair, Sector 62)..."
                    className="w-full bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-sm font-medium rounded-2xl pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-400/30 transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-white transition backdrop-blur-md shadow-lg shrink-0 active:scale-95"
                  title="Search engine XML feed for Google bot"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>Google XML Feed</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Right Trust Stats Card */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-300/30">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Doorstep Guarantee</h2>
                  <p className="text-[11px] sm:text-xs text-blue-100/80">30-Days Post-Service Warranty</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-white/10">
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="block text-xl sm:text-2xl font-black text-white">30 Min</span>
                  <span className="text-[11px] text-blue-200">Express Arrival</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
                  <span className="text-[11px] text-blue-200">Genuine Spares</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-blue-100 pt-1">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <strong className="text-white">4.8 / 5.0</strong> Rating
                </span>
                <span className="text-indigo-200 text-[11px] sm:text-xs">Delhi NCR Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Navigation Filter Tabs & City Chips (Horizontal Scroll on Mobile) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Section Filter</span>
            </div>

            {/* Main Category Tabs: Smooth Horizontal Scroll on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 sm:pb-0">
              {[
                { id: "All", label: "All Pages", count: initialLinks.length },
                { id: "Services", label: "Appliance Services", count: initialLinks.filter((l) => l.group_name === "Services").length },
                { id: "Areas", label: "Area Localities", count: initialLinks.filter((l) => l.group_name === "Area-wise SEO").length },
                { id: "Main", label: "Core Portals", count: initialLinks.filter((l) => l.group_name === "Main Pages").length },
                { id: "Legal", label: "Policies & Terms", count: initialLinks.filter((l) => l.group_name === "Legal & Policies").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-700 hover:text-indigo-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* City Chips for Area-wise Localities */}
          {availableCities.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>City:</span>
              </span>
              <button
                onClick={() => setSelectedCity("All")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedCity === "All"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All Cities
              </button>
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results Summary */}
        {searchTerm && (
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900">
              Found <strong className="text-indigo-700">{filteredLinks.length}</strong> links matching &ldquo;{searchTerm}&rdquo;
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCity("All");
                setActiveTab("All");
              }}
              className="text-xs font-bold text-indigo-700 hover:underline"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* SECTION 1: Appliance Services */}
        {(activeTab === "All" || activeTab === "Services") && servicesLinks.length > 0 && (
          <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">Home Appliance Repair & Maintenance</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Expert certified technicians at your doorstep within 30 minutes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 sm:px-3 py-1 rounded-full border border-indigo-100 shrink-0">
                {servicesLinks.length} Services
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {servicesLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="group relative p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-500 shadow-2xs hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Doorstep Service
                      </span>
                      <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition text-sm sm:text-base leading-snug">
                      {link.title.replace(" - Doorstep Repair & Services", "")}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      Complete diagnosis, genuine spare parts replacement, gas refilling, and warranty certificate provided on service.
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-indigo-700 group-hover:underline flex items-center gap-1">
                      <span>View Rates & Book</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Starts ₹149
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: Area-Wise Localities */}
        {(activeTab === "All" || activeTab === "Areas") && areaLinks.length > 0 && (
          <section className="space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">Area-Wise Service Coverage</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Dedicated local repair engineers in Noida, Ghaziabad, Greater Noida & Delhi</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 sm:px-3 py-1 rounded-full border border-purple-100 shrink-0">
                {areaLinks.length} Localities
              </span>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {Object.entries(areasByCity).map(([city, links]) => (
                <div key={city} className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>{city} Localities</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {links.length} {links.length === 1 ? "sector" : "sectors"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {links.map((link) => (
                      <Link
                        key={link.id}
                        href={link.url}
                        className="group p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/80 border border-slate-200/60 hover:border-purple-300 transition-all flex items-center justify-between"
                      >
                        <div className="truncate pr-2 space-y-0.5">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 truncate" title={link.title}>
                            {link.area || link.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {link.city || city}
                          </div>
                        </div>
                        <div className="p-1 rounded-lg bg-white group-hover:bg-purple-600 text-slate-400 group-hover:text-white transition shrink-0 shadow-2xs">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: Main Pages */}
        {(activeTab === "All" || activeTab === "Main") && mainLinks.length > 0 && (
          <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">Main Pages & Portals</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Official company links, transparent rate cards, and support</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-100 shrink-0">
                {mainLinks.length} Pages
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {mainLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="group p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-xs sm:text-sm">
                      {link.title}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 font-mono">{link.url}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: Legal & Policies */}
        {(activeTab === "All" || activeTab === "Legal") && legalLinks.length > 0 && (
          <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">Policies, Warranty & Terms</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Transparent service terms and consumer privacy commitments</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 sm:px-3 py-1 rounded-full border border-amber-100 shrink-0">
                {legalLinks.length} Policies
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="group p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 group-hover:text-amber-800 text-xs sm:text-sm">
                      {link.title}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 font-mono">{link.url}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Empty State */}
        {filteredLinks.length === 0 && (
          <div className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3 sm:space-y-4 shadow-xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">No matching service or locality found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any pages matching &ldquo;{searchTerm}&rdquo;. You can reset your search or contact our customer support for assistance.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveTab("All");
                setSelectedCity("All");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* 4. Customer Support & Quick Booking Banner (Responsive on Mobile) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Need Immediate Repair in Your Sector?
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black">
              Book a Certified Technician in 60 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Available 7 days a week from 8:00 AM to 9:00 PM across Noida, Greater Noida, Ghaziabad, and Delhi NCR.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <a
              href="tel:+919999251966"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call +91 9999251966</span>
            </a>

            <Link
              href="/#services"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition backdrop-blur-md text-center"
            >
              <span>Explore Services</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
