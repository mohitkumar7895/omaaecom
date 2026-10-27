"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HelpCircle,
  Copy,
  Check,
  X,
  Eye,
  Filter,
  Sparkles,
  MapPin,
  Wrench,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Send,
  Save,
  ChevronDown
} from "lucide-react";
import {
  getSeoPages,
  saveSeoPage,
  deleteSeoPage,
  toggleSeoPageStatus,
  toggleSeoPageIndexable,
  bulkGenerateSeoPages
} from "@/app/actions/seo";

interface SeoPageItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  page_type?: "location" | "avenue" | "society" | "service";
  parent_id?: number | null;
  group_name: string;
  city?: string | null;
  area?: string | null;
  category_id?: number | null;
  service_id?: number | null;
  zone_id?: number | null;
  priority: number;
  changefreq: string;
  is_active: number | boolean;
  is_indexable: number | boolean;
  is_system: number | boolean;
  status: "published" | "draft";
  h1?: string | null;
  h2?: string | null;
  h3?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  subheading?: string | null;
  content?: string | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  canonical_url?: string | null;
  featured_image?: string | null;
  updated_at?: string;
}

interface LocationOption {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
}

interface ZoneOption {
  id: number;
  name: string;
  city_names?: string;
}

interface ParentLocationItem {
  id: number;
  title: string;
  slug: string;
  url: string;
  page_type?: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  indexable: number;
  noindex: number;
}

export default function SeoManager({
  initialPages,
  initialStats,
  categories,
  services,
  locations,
  zones = [],
  parentLocations = [],
}: {
  initialPages: SeoPageItem[];
  initialStats: Stats;
  categories: { id: number; title: string }[];
  services: { id: number; category_id: number; title: string }[];
  locations: LocationOption[];
  zones?: ZoneOption[];
  parentLocations?: ParentLocationItem[];
}) {
  const [pages, setPages] = useState<SeoPageItem[]>(initialPages);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [indexFilter, setIndexFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [pageTypeFilter, setPageTypeFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Skip initial mount fetch since initialPages is already provided by Server Component
  const isFirstMount = useRef(true);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activePage, setActivePage] = useState<Partial<SeoPageItem> | null>(null);

  // Bulk Generator State
  const [bulkServiceId, setBulkServiceId] = useState<string>("");
  const [bulkCategoryId, setBulkCategoryId] = useState<string>(categories[0]?.id ? String(categories[0].id) : "");
  const [bulkLocationsText, setBulkLocationsText] = useState("Sector 62, Sector 18, Sector 137, Sector 76, Gaur City 1, Gaur City 2, Indirapuram, Vaishali");
  const [bulkStatus, setBulkStatus] = useState<"published" | "draft">("published");
  const [bulkIndexable, setBulkIndexable] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Toast notification
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyUrl = (url: string, id: number) => {
    const full = url.startsWith("http") ? url : `https://omaacompany.com${url.startsWith("/") ? "" : "/"}${url}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Re-fetch data via Server Action
  const refreshPages = () => {
    startTransition(async () => {
      try {
        const res = await getSeoPages({
          search,
          status: statusFilter,
          indexable: indexFilter,
          category_id: categoryFilter,
          zone_id: zoneFilter,
          page_type: pageTypeFilter,
        });
        if (res.success && res.pages) {
          setPages(res.pages as SeoPageItem[]);
          if (res.stats) setStats(res.stats);
        } else if (res.error) {
          showToast(res.error, "error");
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load pages", "error");
      }
    });
  };

  // Only re-fetch when user actively changes filter or search
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      refreshPages();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, indexFilter, categoryFilter, zoneFilter, pageTypeFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultZone = zones[0];
    const defaultCat = categories[0];
    const defaultLoc = locations[0] || { name: defaultZone?.name || "Noida", city: "Noida", area: "Sector 62" };
    const defaultTitle = `${defaultCat?.title || "RO Repair"} in ${defaultLoc.name}, ${defaultLoc.city}`;
    const defaultSlug = defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    setActivePage({
      title: defaultTitle,
      slug: defaultSlug,
      page_type: "service",
      parent_id: null,
      zone_id: defaultZone ? defaultZone.id : null,
      h1: `${defaultCat?.title || "RO Repair"} in ${defaultLoc.name}`,
      h2: `Why Choose OMAA for Repair in ${defaultLoc.name}?`,
      h3: `Genuine Spare Parts & Certified Technicians`,
      meta_title: defaultTitle,
      meta_description: `Same-day doorstep ${defaultCat?.title || "appliance repair"} in ${defaultLoc.name}, ${defaultLoc.city}. Call 9999251966 for 30-day warranty & instant service.`,
      subheading: `Doorstep service in ${defaultLoc.name} with upfront pricing and verified technicians.`,
      content: `OMAA Company offers reliable, fast, and transparent doorstep appliance repair in ${defaultLoc.name}. Our technicians carry genuine manufacturer spares and complete repairs within 60 to 90 minutes.`,
      city: defaultLoc.city,
      area: defaultLoc.name,
      category_id: defaultCat?.id || null,
      service_id: null,
      status: "published",
      is_active: 1,
      is_indexable: 0,
      priority: 0.85,
      changefreq: "weekly",
      canonical_url: `/${defaultSlug}`,
      faqs: [
        {
          question: `How fast can a technician reach ${defaultLoc.name}?`,
          answer: `Most bookings in ${defaultLoc.name} receive a verified technician at their doorstep within 60-90 minutes.`,
        },
        {
          question: `Is there a warranty on repairs in ${defaultLoc.name}?`,
          answer: `Yes, all repairs include an official 30-day service warranty and brand-certified spare parts.`,
        },
      ],
    });
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (page: SeoPageItem) => {
    setActivePage({
      ...page,
      faqs: Array.isArray(page.faqs) && page.faqs.length > 0 ? page.faqs : [],
    });
    setIsEditorOpen(true);
  };

  // Save Page (Create or Update via Server Action)
  const handleSavePage = async () => {
    if (!activePage || !activePage.title?.trim()) {
      showToast("Page Title is required", "error");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveSeoPage(activePage);
        if (res.success) {
          showToast(res.message || "Page saved successfully!");
          setIsEditorOpen(false);
          setActivePage(null);
          refreshPages();
        } else {
          showToast(res.error || "Failed to save page", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Failed to save page", "error");
      }
    });
  };

  // Delete Page via Server Action
  const handleDeletePage = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        const res = await deleteSeoPage(id);
        if (res.success) {
          showToast(res.message || "Page deleted");
          refreshPages();
        } else {
          showToast(res.error || "Failed to delete", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Quick Toggle Status (Publish / Draft via Server Action)
  const handleToggleStatus = async (page: SeoPageItem) => {
    const nextStatus = page.status === "published" ? "draft" : "published";
    startTransition(async () => {
      try {
        const res = await toggleSeoPageStatus(page.id, nextStatus);
        if (res.success) {
          showToast(`Page is now ${nextStatus}`);
          refreshPages();
        } else {
          showToast(res.error || "Failed to update status", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Quick Toggle Indexable (Google Index / Noindex via Server Action)
  const handleToggleIndexable = async (page: SeoPageItem) => {
    const nextVal = !Boolean(page.is_indexable);
    startTransition(async () => {
      try {
        const res = await toggleSeoPageIndexable(page.id, nextVal);
        if (res.success) {
          showToast(nextVal ? "Marked for Google Indexing" : "Marked Noindex");
          refreshPages();
        } else {
          showToast(res.error || "Failed to update indexing", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Bulk Generator Execution via Server Action
  const handleBulkGenerate = async () => {
    const areas = bulkLocationsText.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (areas.length === 0) {
      showToast("Please enter at least one location", "error");
      return;
    }

    setBulkGenerating(true);
    startTransition(async () => {
      try {
        const res = await bulkGenerateSeoPages({
          category_id: bulkCategoryId ? Number(bulkCategoryId) : null,
          service_id: bulkServiceId ? Number(bulkServiceId) : null,
          locations: areas,
          status: bulkStatus,
          is_indexable: bulkIndexable,
        });

        if (res.success) {
          showToast(res.message || `Generated ${res.count} pages!`);
          setIsBulkOpen(false);
          refreshPages();
        } else {
          showToast(res.error || "Bulk generation failed", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setBulkGenerating(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dynamic SEO Management Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              SEO Pages & Dynamic Landing Templates
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Create, customize, and manage unlimited Service + Location SEO landing pages. Every page dynamically uses the high-converting SEO template with H1/H2/H3, FAQ accordion, Call/WhatsApp CTA, and automated XML Sitemap synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
            >
              <Layers className="w-4 h-4 text-indigo-300" />
              <span>Bulk Service+Location</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dynamic SEO Page</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Pages</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Published</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{stats.published}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">Drafts</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{stats.draft}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-indigo-400 uppercase font-bold tracking-wider">Google Indexable</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">{stats.indexable}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Noindex</span>
            <div className="text-xl sm:text-2xl font-black text-slate-300 mt-0.5">{stats.noindex}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, city, area, or heading..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          <select
            value={indexFilter}
            onChange={(e) => setIndexFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Indexing</option>
            <option value="yes">Indexable in Google</option>
            <option value="no">Noindex</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Service Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Service Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <select
            value={pageTypeFilter}
            onChange={(e) => setPageTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Page Types</option>
            <option value="location">Parent Locations</option>
            <option value="avenue">Child Avenues</option>
            <option value="society">Child Societies</option>
            <option value="service">Standard Services</option>
          </select>

          <button
            onClick={refreshPages}
            disabled={isPending}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Page & URL Slug</th>
                <th className="py-3.5 px-4">Location / Hierarchy</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Google Index</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No SEO pages found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your filters or create a new page.</p>
                  </td>
                </tr>
              ) : (
                pages.map((p) => {
                  const liveUrl = p.url.startsWith("/") ? p.url : `/${p.url}`;
                  const isPublished = p.status === "published" && Boolean(p.is_active);
                  const isIndexable = Boolean(p.is_indexable);
                  const pageType = p.page_type || "service";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title & URL Slug */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          <span>{p.title}</span>
                          {pageType === "location" && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full shrink-0">
                              Parent Location
                            </span>
                          )}
                          {pageType === "avenue" && (
                            <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full shrink-0">
                              Child Avenue
                            </span>
                          )}
                          {pageType === "society" && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                              Child Society
                            </span>
                          )}
                          {p.h1 && p.h1 !== p.title && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                              H1: {p.h1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                            {liveUrl}
                          </code>
                          <button
                            onClick={() => copyUrl(liveUrl, p.id)}
                            className="hover:text-indigo-600 p-0.5"
                            title="Copy link"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Location / Zone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{[p.area, p.city].filter(Boolean).join(", ") || "Delhi NCR"}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400">{p.group_name || "Area-wise SEO"}</span>
                          {p.zone_id ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                              Zone: {zones.find((z) => z.id === p.zone_id)?.name || `#${p.zone_id}`}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Status (Published vs Draft) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-slate-400"}`} />
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Google Indexable */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleIndexable(p)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isIndexable
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          }`}
                          title={isIndexable ? "Included in sitemap.xml & indexable by Google" : "Excluded from sitemap & noindex"}
                        >
                          <span>{isIndexable ? "Indexed" : "Noindex"}</span>
                        </button>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 text-center text-xs font-mono font-semibold text-slate-600">
                        {p.priority || 0.8}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => {
                              setActivePage(p);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Preview SEO Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Open Live URL */}
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Open live URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit page"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          {!p.is_system && (
                            <button
                              onClick={() => handleDeletePage(p.id, p.title)}
                              disabled={isPending}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Full SEO Page Editor Modal */}
      {isEditorOpen && activePage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {activePage.id ? "Edit Dynamic SEO Page" : "Create New Dynamic SEO Page"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure URL, headings, metadata, content, and structured FAQs</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Row 0: Hierarchy & Page Type Selection */}
              {(() => {
                const selectedParent = parentLocations?.find((p) => p.id === activePage.parent_id);
                const derivedParentPrefix = selectedParent ? selectedParent.url.replace(/\/+$/, "") : "";
                const isChildType = activePage.page_type === "avenue" || activePage.page_type === "society";

                return (
                  <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Location Hierarchy & Page Type</span>
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/60 px-2.5 py-0.5 rounded-full">
                        Dynamic Parent-Child SEO
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Page Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={activePage.page_type || "service"}
                          onChange={(e) => {
                            const nextType = e.target.value as "location" | "avenue" | "society" | "service";
                            const needsParent = nextType === "avenue" || nextType === "society";
                            const defaultParent = needsParent ? (activePage.parent_id || parentLocations[0]?.id || null) : null;
                            setActivePage((prev) => ({
                              ...prev,
                              page_type: nextType,
                              parent_id: defaultParent,
                            }));
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="service">Standard Service Page (e.g. RO Repair Sector 62)</option>
                          <option value="location">Parent Location (e.g. Gaur City 2, Gaur City 1)</option>
                          <option value="avenue">Child Avenue (e.g. 10th Avenue under Gaur City 2)</option>
                          <option value="society">Child Society (e.g. White Orchid under Gaur City 2)</option>
                        </select>
                      </div>

                      {isChildType && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Parent Location <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={activePage.parent_id || ""}
                            onChange={(e) =>
                              setActivePage((prev) => ({
                                ...prev,
                                parent_id: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          >
                            <option value="">Select Parent Location</option>
                            {parentLocations.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} ({p.url})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Full Dynamic Live URL Preview */}
                    {/* Full Dynamic Live URL Preview */}
                    <div className="bg-white p-3.5 rounded-xl border border-indigo-200/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-xs gap-2">
                      <div className="flex items-center gap-2 truncate flex-1">
                        <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-500 shrink-0">Live URL Preview:</span>
                        <span className="font-mono text-emerald-700 font-bold truncate">
                          https://omaacompany.com{(() => {
                            const cleanSlug = (activePage.slug || "").replace(/^\/+/, "");
                            if (isChildType && selectedParent) {
                              return `${derivedParentPrefix}/${cleanSlug || "slug"}`;
                            }
                            return cleanSlug ? `/${cleanSlug}` : "/your-custom-url";
                          })()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-600 self-start sm:self-auto">
                        {isChildType && selectedParent ? `Nested under ${selectedParent.slug}` : "Custom Direct URL"}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Row 1: Title & Slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Page Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activePage.title || ""}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setActivePage((prev) => {
                        const autoSlug = !prev?.id
                          ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                          : prev?.slug;
                        return {
                          ...prev,
                          title: newTitle,
                          slug: autoSlug,
                          h1: prev?.h1 || newTitle,
                          meta_title: prev?.meta_title || newTitle,
                        };
                      });
                    }}
                    placeholder="e.g. RO Water Purifier Repair in Sector 62, Noida"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      URL Slug / Custom Path <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Supports any custom URL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono truncate max-w-[150px]">
                      {activePage.parent_id
                        ? `${parentLocations.find((p) => p.id === activePage.parent_id)?.url || ""}/`
                        : "/"}
                    </span>
                    <input
                      type="text"
                      value={activePage.slug || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, slug: e.target.value.replace(/^\/+/, "") }))}
                      placeholder="e.g. ro-repair OR services/delhi/ro-repair"
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Service & Service Zone / Location Selection */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Associated Service / Category</span>
                    </label>
                    <select
                      value={activePage.category_id || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">General Home Appliance Repair</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Admin Service Zone Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Service Zone (Admin Zone)</span>
                      </span>
                      <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        Admin Zone
                      </span>
                    </label>
                    <select
                      value={activePage.zone_id || ""}
                      onChange={(e) => {
                        const selectedZoneId = e.target.value ? Number(e.target.value) : null;
                        const matchedZone = zones.find((z) => z.id === selectedZoneId);
                        setActivePage((prev) => ({
                          ...prev,
                          zone_id: selectedZoneId,
                          city: matchedZone ? (matchedZone.city_names?.split(",")[0]?.trim() || "Noida") : prev?.city,
                          area: matchedZone && !prev?.area ? matchedZone.name : prev?.area,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">-- Select Service Zone (From Admin) --</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} {z.city_names ? `(${z.city_names})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* City and Specific Locality Fields */}
                <div className="grid sm:grid-cols-2 gap-4 pt-1 border-t border-slate-200/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      value={activePage.city || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Noida, Greater Noida, Delhi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specific Locality / Society / Sector
                    </label>
                    <input
                      type="text"
                      value={activePage.area || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, area: e.target.value }))}
                      placeholder="e.g. Sector 62, Gaur City 2, 10th Avenue"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Headings (H1, H2, H3) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Heading Structure</div>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H1 Heading</label>
                    <input
                      type="text"
                      value={activePage.h1 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h1: e.target.value }))}
                      placeholder="e.g. RO Repair in Sector 62"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H2 Section Heading</label>
                    <input
                      type="text"
                      value={activePage.h2 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h2: e.target.value }))}
                      placeholder="e.g. Why Choose OMAA Experts?"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H3 Subsection</label>
                    <input
                      type="text"
                      value={activePage.h3 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h3: e.target.value }))}
                      placeholder="e.g. Genuine Manufacturer Spares"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Meta Information (SEO Title & Meta Description) */}
              <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Google Search Metadata</span>
                  <span className="text-[11px] text-slate-500">Live SERP Preview Enabled</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Meta Title</span>
                    <span className={(activePage.meta_title?.length || 0) > 60 ? "text-amber-600" : "text-slate-400"}>
                      {activePage.meta_title?.length || 0} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={activePage.meta_title || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Page Title shown in search engines"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Meta Description</span>
                    <span className={(activePage.meta_description?.length || 0) > 160 ? "text-amber-600" : "text-slate-400"}>
                      {activePage.meta_description?.length || 0} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activePage.meta_description || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description shown in Google search results"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                {/* Google Snippet Preview */}
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] text-emerald-700 font-mono">
                    https://omaacompany.com/{activePage.slug || "slug"}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                    {activePage.meta_title || activePage.title || "Page Title"} | Call 9999251966
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {activePage.meta_description || "Add a compelling meta description to improve click-through rates from Google search results."}
                  </div>
                </div>
              </div>

              {/* Row 5: SEO Content Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Content Body
                </label>
                <textarea
                  rows={4}
                  value={activePage.content || ""}
                  onChange={(e) => setActivePage((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed SEO description, repair steps, symptoms fixed, and reasons to choose OMAA technicians..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Row 6: Dynamic FAQ Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Frequently Asked Questions ({activePage.faqs?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage((prev) => ({
                        ...prev,
                        faqs: [...(prev?.faqs || []), { question: "", answer: "" }],
                      }));
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(activePage.faqs || []).map((faq, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2 items-start">
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...(activePage.faqs || [])];
                            updated[idx].question = e.target.value;
                            setActivePage((prev) => ({ ...prev, faqs: updated }));
                          }}
                          placeholder={`Question #${idx + 1}`}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...(activePage.faqs || [])];
                            updated[idx].answer = e.target.value;
                            setActivePage((prev) => ({ ...prev, faqs: updated }));
                          }}
                          placeholder={`Answer #${idx + 1}`}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (activePage.faqs || []).filter((_, i) => i !== idx);
                          setActivePage((prev) => ({ ...prev, faqs: updated }));
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove question"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 7: Canonical URL, Indexing & Status Toggles */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={activePage.status || "published"}
                    onChange={(e) => setActivePage((prev) => ({
                      ...prev,
                      status: e.target.value as "published" | "draft",
                      is_active: e.target.value === "published" ? 1 : 0,
                    }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Google Indexing</label>
                  <select
                    value={activePage.is_indexable ? "1" : "0"}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, is_indexable: e.target.value === "1" ? 1 : 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="0">Noindex (Recommended during test)</option>
                    <option value="1">Index in Google (Included in Sitemap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={activePage.canonical_url || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="e.g. /ro-water-purifier-repair"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Preview Template</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePage}
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{activePage.id ? "Update SEO Page" : "Publish SEO Page"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Template Preview Modal */}
      {isPreviewOpen && activePage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold font-mono">Live Template Preview: /{activePage.slug || "slug"}</span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated SEO Page Preview */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
                <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                  Home / {activePage.city || "Noida"} / {activePage.area || "Sector 62"}
                </div>
                <h1 className="text-3xl font-black text-slate-900">
                  {activePage.h1 || activePage.title}
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  {activePage.subheading || activePage.meta_description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <span className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm">
                    Call 9999251966
                  </span>
                  <span className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm">
                    WhatsApp Chat
                  </span>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    {activePage.h2 || "Why Choose Our Verified Technicians?"}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {activePage.content || "Doorstep service completed within 60-90 minutes with 30-day warranty."}
                  </p>
                </div>

                {activePage.h3 && (
                  <div className="pt-4">
                    <h3 className="text-base font-bold text-slate-900 mb-2">{activePage.h3}</h3>
                    <p className="text-xs text-slate-500">Service guaranteed under published rate card protocols.</p>
                  </div>
                )}

                {/* FAQ Section */}
                {activePage.faqs && activePage.faqs.length > 0 && (
                  <div className="pt-6 border-t border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                      {activePage.faqs.map((faq, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                          <div className="font-bold text-sm text-slate-900">{faq.question}</div>
                          <div className="text-xs text-slate-600 mt-1">{faq.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-white border-t border-slate-100 text-right">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bulk Service + Location Generator Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Bulk Service + Location Generator</h3>
                  <p className="text-xs text-slate-500">Generate high-converting SEO pages in batch</p>
                </div>
              </div>
              <button onClick={() => setIsBulkOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Service Category</label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Locations / Sectors (Comma or newline separated)
                </label>
                <textarea
                  rows={4}
                  value={bulkLocationsText}
                  onChange={(e) => setBulkLocationsText(e.target.value)}
                  placeholder="Sector 62, Sector 18, Sector 137, Gaur City 1, Gaur City 2, Indirapuram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as "published" | "draft")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Google Indexable</label>
                  <select
                    value={bulkIndexable ? "1" : "0"}
                    onChange={(e) => setBulkIndexable(e.target.value === "1")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="0">Noindex (Safe Mode)</option>
                    <option value="1">Index in Google</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{bulkGenerating ? "Generating..." : "Generate Pages"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
