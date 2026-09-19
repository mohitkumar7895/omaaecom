"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Globe,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  Sparkles,
  Filter,
  Check,
  AlertCircle,
  FileCode,
  HelpCircle,
  Building2,
  Copy,
  Info,
  X
} from "lucide-react";

interface SitemapLink {
  id: number;
  title: string;
  url: string;
  group_name: string;
  city?: string | null;
  area?: string | null;
  category_id?: number | null;
  priority: number;
  changefreq: string;
  is_active: boolean | number;
  is_system: boolean | number;
  heading?: string | null;
  subheading?: string | null;
  content?: string | null;
  meta_description?: string | null;
  features?: any;
  updated_at?: string;
}

interface CategoryOption {
  id: number;
  title: string;
}

interface Stats {
  total: number;
  active: number;
  areaWise: number;
  services: number;
  mainPages: number;
}

export default function SitemapManager({
  categories,
  initialLinks,
  initialStats,
}: {
  categories: CategoryOption[];
  initialLinks: SitemapLink[];
  initialStats: Stats;
}) {
  const [links, setLinks] = useState<SitemapLink[]>(initialLinks);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Modals
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<SitemapLink> | null>(null);

  // Area Generator Form State
  const [areaForm, setAreaForm] = useState({
    category_id: "",
    city: "Noida",
    areasInput: "Sector 62, Sector 18, Sector 137, Sector 76, Sector 50, Gaur City 1, Gaur City 2, Indirapuram, Vaishali, Crossings Republik",
    priority: "0.9",
    changefreq: "weekly",
  });

  // Selected items for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Prevent background scrolling when modals are open and enable Escape key to close
  useEffect(() => {
    if (isAreaModalOpen || isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAreaModalOpen(false);
        setIsEditModalOpen(false);
        setEditingLink(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAreaModalOpen, isEditModalOpen]);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Re-fetch links & stats from API
  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sitemap");
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Sync
  const handleSyncSystem = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/sitemap/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message);
        await refreshData();
      } else {
        showFeedback(data.error || "Sync failed", "error");
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (link: SitemapLink) => {
    const nextStatus = !Boolean(link.is_active);
    try {
      setLinks((prev) =>
        prev.map((item) => (item.id === link.id ? { ...item, is_active: nextStatus } : item))
      );
      setStats((prev) => ({
        ...prev,
        active: nextStatus ? prev.active + 1 : prev.active - 1,
      }));

      const res = await fetch("/api/admin/sitemap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showFeedback(err.message || "Failed to update status", "error");
      await refreshData();
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: number) => {
    if (!confirm("Are you sure you want to remove this URL from the sitemap?")) return;
    try {
      const res = await fetch("/api/admin/sitemap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("URL deleted successfully!");
        setLinks((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        refreshData();
      } else {
        showFeedback(data.error, "error");
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected URLs?`)) return;
    try {
      const res = await fetch("/api/admin/sitemap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message);
        setSelectedIds([]);
        refreshData();
      } else {
        showFeedback(data.error, "error");
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    }
  };

  // Submit Area Generator
  const handleGenerateAreas = async (e: React.FormEvent) => {
    e.preventDefault();
    const areasArray = areaForm.areasInput
      .split(/[\n,]/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (areasArray.length === 0) {
      showFeedback("Please enter at least one area name.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_bulk_area: true,
          category_id: areaForm.category_id ? Number(areaForm.category_id) : null,
          city: areaForm.city.trim(),
          areas: areasArray,
          priority: parseFloat(areaForm.priority),
          changefreq: areaForm.changefreq,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(data.message);
        setIsAreaModalOpen(false);
        await refreshData();
      } else {
        showFeedback(data.error || "Failed to generate area links", "error");
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Save Single Link (Create or Update)
  const handleSaveSingleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.title || !editingLink?.url) {
      showFeedback("Title and URL are required.", "error");
      return;
    }

    try {
      setLoading(true);
      const isUpdate = Boolean(editingLink.id);

      const featuresArray = typeof editingLink.features === "string"
        ? editingLink.features.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean)
        : editingLink.features;

      const res = await fetch("/api/admin/sitemap", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingLink,
          features: featuresArray,
          priority: parseFloat(String(editingLink.priority || "0.8")),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(data.message);
        setIsEditModalOpen(false);
        setEditingLink(null);
        await refreshData();
      } else {
        showFeedback(data.error, "error");
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesGroup =
        selectedGroup === "All" ||
        link.group_name.toLowerCase() === selectedGroup.toLowerCase();

      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        link.title.toLowerCase().includes(term) ||
        link.url.toLowerCase().includes(term) ||
        (link.city && link.city.toLowerCase().includes(term)) ||
        (link.area && link.area.toLowerCase().includes(term));

      return matchesGroup && matchesSearch;
    });
  }, [links, selectedGroup, search]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLinks.length && filteredLinks.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLinks.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const setCityPreset = (cityName: string, defaultAreas: string) => {
    setAreaForm((prev) => ({
      ...prev,
      city: cityName,
      areasInput: defaultAreas,
    }));
  };

  // Preview computation for Area Modal
  const previewData = useMemo(() => {
    const rawAreas = areaForm.areasInput.split(/[\n,]/).map((a) => a.trim()).filter(Boolean);
    const firstArea = rawAreas[0] || "Sector 62";
    const selectedCat = categories.find((c) => c.id === Number(areaForm.category_id));
    const catName = selectedCat ? selectedCat.title : "Appliance Repair & Maintenance";
    const citySlug = (areaForm.city || "noida").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const areaSlug = firstArea.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const sampleTitle = areaForm.category_id
      ? `${catName} in ${firstArea}, ${areaForm.city || "Noida"}`
      : `Appliance Repair & Maintenance in ${firstArea}, ${areaForm.city || "Noida"}`;

    const sampleUrl = areaForm.category_id
      ? `/services/${areaForm.category_id}?city=${citySlug}&area=${areaSlug}`
      : `/${citySlug}?area=${areaSlug}`;

    return {
      count: rawAreas.length,
      sampleTitle,
      sampleUrl,
    };
  }, [areaForm, categories]);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Feedback */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-semibold border shadow-lg transition-all ${feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100 p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Actions Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4" />
              <span>SEO & Google Crawling Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Sitemap & Area-Wise SEO Manager
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Admin-only. Website visitors do not see this. Google reads <span className="font-mono text-indigo-700">/sitemap.xml</span> for ranking.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl border border-gray-200 transition"
              title="How Area-wise SEO and Sitemap works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showGuide ? "Hide Guide" : "How it Works"}</span>
            </button>

            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-xl border border-indigo-200 transition shadow-xs"
              title="Google Search Console XML sitemap"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google sitemap.xml</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={handleSyncSystem}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 rounded-xl border border-gray-300 transition shadow-xs"
              title="Re-scan database categories and core pages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-indigo-600" : "text-gray-500"}`} />
              <span>{syncing ? "Syncing..." : "Sync Pages"}</span>
            </button>

            {/* Primary Action 1: Bulk Area Builder */}
            <button
              onClick={() => setIsAreaModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Area-Wise SEO Builder</span>
            </button>

            {/* Primary Action 2: Add Single URL */}
            <button
              onClick={() => {
                setEditingLink({
                  title: "",
                  url: "/",
                  group_name: "Custom",
                  priority: 0.8,
                  changefreq: "weekly",
                  is_active: true,
                });
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Link</span>
            </button>
          </div>
        </div>

        {/* Collapsible How It Works / SEO Guide Card */}
        {showGuide && (
          <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Area-Wise Local SEO & Sitemap Guide (Aasan Bhasha Me)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs text-indigo-950">
              <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-1">
                <span className="font-bold text-indigo-700 block text-xs">1. Area-Wise SEO Kyun Zaroori Hai?</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Jab customer Google par search karta hai <i>&ldquo;AC repair in Noida Sector 62&rdquo;</i> ya <i>&ldquo;Washing Machine repair in Indirapuram&rdquo;</i>, tab Google unhi websites ko top rank deta hai jinke paas specific area landing URLs hote hain.
                </p>
              </div>
              <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-1">
                <span className="font-bold text-indigo-700 block text-xs">2. Bulk Area Builder Kaise Kaam Karta Hai?</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Bas category (jaise AC Repair) aur apne city ke sectors/areas comma daal kar likhein. System automatically unke clean SEO URLs banakar sitemap.xml me jod dega.
                </p>
              </div>
              <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-1">
                <span className="font-bold text-indigo-700 block text-xs">3. Real-Time Active Toggle</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Kisi bhi link ke switch ko band karte hi wo Google ke <code className="bg-gray-100 px-1 rounded text-indigo-600 font-mono">/sitemap.xml</code> se turant hide ho jati hai bina code edit kiye.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 transition hover:bg-slate-100/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total URLs</span>
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-gray-900">{stats.total}</span>
              <span className="text-[11px] text-gray-500">total indexed</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 transition hover:bg-emerald-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Live In XML</span>
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">{stats.active}</span>
              <span className="text-[11px] text-emerald-600">live feed</span>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-3.5 sm:p-4 transition hover:bg-purple-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Area-Wise SEO</span>
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-purple-700">{stats.areaWise}</span>
              <span className="text-[11px] text-purple-600">local keywords</span>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 transition hover:bg-amber-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Core & Services</span>
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-amber-700">{stats.services + stats.mainPages}</span>
              <span className="text-[11px] text-amber-600">catalog pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Pills with Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: "All", label: "All Links", count: links.length },
              { id: "Area-wise SEO", label: "Area-wise SEO", count: links.filter((l) => l.group_name === "Area-wise SEO").length },
              { id: "Services", label: "Services", count: links.filter((l) => l.group_name === "Services").length },
              { id: "Main Pages", label: "Main Pages", count: links.filter((l) => l.group_name === "Main Pages").length },
              { id: "Legal & Policies", label: "Legal & Policies", count: links.filter((l) => l.group_name === "Legal & Policies").length },
              { id: "Custom", label: "Custom", count: links.filter((l) => l.group_name === "Custom").length },
            ].map((grp) => (
              <button
                key={grp.id}
                onClick={() => setSelectedGroup(grp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${selectedGroup === grp.id
                    ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-200"
                  }`}
              >
                <span>{grp.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedGroup === grp.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {grp.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by locality, title, or URL..."
              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions Banner */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl animate-in fade-in duration-150">
            <span className="text-xs font-bold text-indigo-900">
              {selectedIds.length} URLs selected for bulk actions
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-white font-bold bg-rose-100 hover:bg-rose-600 px-3 py-1.5 rounded-lg border border-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Responsive Dual View (Cards on Mobile, Table on Tablet/Desktop) */}
      
      {/* 1. Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
            <Search className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700 text-sm">No sitemap links found</p>
            <p className="text-xs text-gray-400">Try changing your search or filter tab.</p>
          </div>
        ) : (
          filteredLinks.map((link) => {
            const isActive = Boolean(link.is_active);
            const isSelected = selectedIds.includes(link.id);

            return (
              <div
                key={link.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-indigo-50/50 border-indigo-300 shadow-sm"
                    : "bg-white border-gray-200/90 shadow-2xs"
                } space-y-3`}
              >
                {/* Top Row: Checkbox, Title & Active Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(link.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-0 cursor-pointer mt-1"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">
                        {link.title}
                      </h4>
                      {(link.city || link.area) && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 mt-0.5">
                          <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>
                            {link.area ? `${link.area}, ` : ""}
                            {link.city}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex flex-col items-end shrink-0">
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                      title={isActive ? "Active in Google Sitemap" : "Hidden from Google Sitemap"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-bold mt-0.5 ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                      {isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* URL Display with 1-tap Copy & Link */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-indigo-700">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition"
                      title="Copy URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-gray-400 hover:text-indigo-600 transition"
                      title="Open page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Metadata Badges & Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        link.group_name === "Area-wise SEO"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : link.group_name === "Services"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : link.group_name === "Main Pages"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {link.group_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                      P: {Number(link.priority).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize">
                      {link.changefreq}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLink(link);
                        setIsEditModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete URL"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (>= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredLinks.length && filteredLinks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4 w-24">Live In XML</th>
                <th className="p-4">Page Title & Locality</th>
                <th className="p-4">URL / Path</th>
                <th className="p-4 w-28">Group</th>
                <th className="p-4 w-20 text-center">Priority</th>
                <th className="p-4 w-24">Frequency</th>
                <th className="p-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="space-y-2">
                      <Search className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="font-semibold text-gray-700 text-sm">No sitemap links found</p>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        No links matched your current search or filter. Try clearing your search term or switching tabs.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link, idx) => {
                  const isActive = Boolean(link.is_active);
                  const isSelected = selectedIds.includes(link.id);

                  return (
                    <tr
                      key={link.id}
                      className={`hover:bg-indigo-50/30 transition ${
                        isSelected ? "bg-indigo-50/50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(link.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(link)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isActive ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                          title={isActive ? "Active in Google Sitemap. Click to deactivate." : "Hidden from Google Sitemap. Click to activate."}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`block text-[10px] font-bold mt-0.5 ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      {/* Title & Location details */}
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-gray-900 text-sm" title={link.title}>
                          {link.title}
                        </div>
                        {(link.city || link.area) ? (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 mt-0.5">
                            <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>
                              {link.area ? `${link.area}, ` : ""}
                              {link.city}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sitewide page</span>
                        )}
                      </td>

                      {/* URL */}
                      <td className="p-4 font-mono text-[11px] text-indigo-700 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate max-w-[200px]"
                            title={link.url}
                          >
                            {link.url}
                          </a>
                          <button
                            onClick={() => copyToClipboard(link.url, link.id)}
                            className="text-gray-400 hover:text-indigo-600 transition shrink-0 p-1"
                            title="Copy URL"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            link.group_name === "Area-wise SEO"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : link.group_name === "Services"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : link.group_name === "Main Pages"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : link.group_name === "Legal & Policies"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {link.group_name}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black ${
                            Number(link.priority) >= 0.9
                              ? "bg-emerald-100 text-emerald-800"
                              : Number(link.priority) >= 0.7
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {Number(link.priority).toFixed(1)}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="p-4 text-gray-600 capitalize font-medium">{link.changefreq}</td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingLink(link);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit URL details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete URL"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: Area-Wise SEO Link Builder (Fully Responsive with Touch Targets) */}
      {isAreaModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAreaModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header: Sticky */}
            <div className="shrink-0 p-4 sm:p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                    Area-Wise Local SEO Builder
                  </h3>
                  <p className="text-[11px] sm:text-xs text-indigo-100">
                    Bulk-generate local area URLs for fast Google Search indexing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAreaModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition text-sm font-bold"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <form onSubmit={handleGenerateAreas} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
              {/* Target Service Category */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-900 text-xs sm:text-sm">
                  1. Target Service Category
                </label>
                <select
                  value={areaForm.category_id}
                  onChange={(e) => setAreaForm({ ...areaForm, category_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                >
                  <option value="">All Services General (City & Local Area Landing Pages)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection with Quick Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-900 text-xs sm:text-sm">
                    2. Select Target City & Quick Presets
                  </label>
                  <span className="text-[10px] text-gray-400">Click preset to autofill</span>
                </div>

                {/* Responsive Quick Preset Pills */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                  {[
                    {
                      name: "Noida",
                      label: "Noida Sectors",
                      areas: "Sector 62, Sector 18, Sector 137, Sector 76, Sector 50, Sector 128, Sector 150, Gaur City 1, Gaur City 2",
                    },
                    {
                      name: "Ghaziabad",
                      label: "Ghaziabad Localities",
                      areas: "Indirapuram, Vaishali, Vasundhara, Crossings Republik, Raj Nagar Extension, Kaushambi",
                    },
                    {
                      name: "Greater Noida",
                      label: "Greater Noida",
                      areas: "Pari Chowk, Alpha 1, Beta 2, Gamma 1, Delta 2, Knowledge Park, Surajpur",
                    },
                    {
                      name: "Delhi",
                      label: "Delhi NCR",
                      areas: "Mayur Vihar, Laxmi Nagar, Dwarka, Rohini, Saket, Janakpuri, Pitampura, Vasant Kunj",
                    },
                    {
                      name: "Gurgaon",
                      label: "Gurgaon Hubs",
                      areas: "Cyber City, DLF Phase 1, DLF Phase 2, DLF Phase 3, Sector 14, Sector 56, Golf Course Road",
                    },
                    {
                      name: "Meerut",
                      label: "Meerut",
                      areas: "Sadar Bazaar, Shastri Nagar, Ganga Nagar, Pallavpuram, Kankerkhera, Modipuram",
                    },
                  ].map((preset) => {
                    const isSelected = areaForm.city.toLowerCase() === preset.name.toLowerCase();
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setCityPreset(preset.name, preset.areas)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition active:scale-95 ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={areaForm.city}
                  onChange={(e) => setAreaForm({ ...areaForm, city: e.target.value })}
                  placeholder="City name (e.g. Noida, Gurgaon, Delhi)..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Localities Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-900 text-xs sm:text-sm">
                    3. Sectors / Localities (Separate with comma or newline)
                  </label>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {previewData.count} Localities
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={areaForm.areasInput}
                  onChange={(e) => setAreaForm({ ...areaForm, areasInput: e.target.value })}
                  placeholder="e.g. Sector 62, Sector 18, Indirapuram, Gaur City 2, Vaishali"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Priority & Frequency Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">SEO Priority</label>
                  <select
                    value={areaForm.priority}
                    onChange={(e) => setAreaForm({ ...areaForm, priority: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="1.0">1.0 (Top Priority)</option>
                    <option value="0.9">0.9 (Very High - Recommended)</option>
                    <option value="0.8">0.8 (Standard High)</option>
                    <option value="0.7">0.7 (Normal)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Google Crawl Frequency</label>
                  <select
                    value={areaForm.changefreq}
                    onChange={(e) => setAreaForm({ ...areaForm, changefreq: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Recommended)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Live Generated URL Preview:
                </span>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {previewData.sampleTitle}
                </p>
                <p className="text-[11px] font-mono text-indigo-700 truncate">
                  {previewData.sampleUrl}
                </p>
              </div>

              {/* Submit Buttons: Inside Form Footer */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Generating..." : `Generate ${previewData.count} URLs`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add or Edit Single Link (Fully Responsive) */}
      {isEditModalOpen && editingLink && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setEditingLink(null);
            }
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in zoom-in-95 duration-200">
            {/* Header: Sticky */}
            <div className="shrink-0 p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  {editingLink.id ? <Edit2 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                </div>
                <h3 className="text-base font-bold">
                  {editingLink.id ? "Edit Sitemap URL" : "Add Custom Sitemap URL"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingLink(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Body: Scrollable */}
            <form onSubmit={handleSaveSingleLink} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  value={editingLink.title || ""}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  placeholder="e.g. AC Repair in Noida Sector 62"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">URL / Path *</label>
                <input
                  type="text"
                  required
                  value={editingLink.url || ""}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  placeholder="e.g. /services/1?city=noida or /noida"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Group Name</label>
                  <select
                    value={editingLink.group_name || "Custom"}
                    onChange={(e) => setEditingLink({ ...editingLink, group_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Main Pages">Main Pages</option>
                    <option value="Services">Services</option>
                    <option value="Area-wise SEO">Area-wise SEO</option>
                    <option value="Legal & Policies">Legal & Policies</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Priority (0.1 - 1.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={editingLink.priority || 0.8}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, priority: parseFloat(e.target.value) })
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Crawl Frequency</label>
                  <select
                    value={editingLink.changefreq || "weekly"}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, changefreq: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">City (Optional)</label>
                  <input
                    type="text"
                    value={editingLink.city || ""}
                    onChange={(e) => setEditingLink({ ...editingLink, city: e.target.value })}
                    placeholder="e.g. Noida"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Area / Locality (Optional)</label>
                <input
                  type="text"
                  value={editingLink.area || ""}
                  onChange={(e) => setEditingLink({ ...editingLink, area: e.target.value })}
                  placeholder="e.g. Sector 62"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingLink(null);
                  }}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save URL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
