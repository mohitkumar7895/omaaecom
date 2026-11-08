"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
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
  ChevronDown,
  Building,
  Home as HomeIcon,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square
} from "lucide-react";
import {
  getSeoPages,
  saveSeoPage,
  deleteSeoPage,
  toggleSeoPageStatus,
  toggleSeoPageIndexable,
  bulkGenerateSeoPages,
  duplicateSeoPage,
  getParentLocations,
  saveParentLocation,
  deleteParentLocation,
  getChildAvenues,
  saveChildAvenue,
  deleteChildAvenue,
  getChildSocieties,
  saveChildSociety,
  deleteChildSociety
} from "@/app/actions/seo";

export interface SeoPageItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  page_type?: "location" | "avenue" | "society" | "service";
  parent_id?: number | null;
  parent_location_id?: number | null;
  child_avenue_id?: number | null;
  child_society_id?: number | null;
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

export interface ParentLocationItem {
  id: number;
  name: string;
  title?: string;
  slug: string;
  url?: string;
  zone_id?: number | null;
  zone_name?: string | null;
  city: string;
  description?: string | null;
  status: "Active" | "Inactive";
  avenues_count?: number;
  societies_count?: number;
  pages_count?: number;
}

export interface ChildAvenueItem {
  id: number;
  parent_location_id: number;
  name: string;
  slug: string;
  description?: string | null;
  status: "Active" | "Inactive";
  parent_name?: string;
  parent_slug?: string;
  city?: string;
  pages_count?: number;
}

export interface ChildSocietyItem {
  id: number;
  parent_location_id: number;
  child_avenue_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  status: "Active" | "Inactive";
  parent_name?: string;
  parent_slug?: string;
  city?: string;
  avenue_name?: string | null;
  pages_count?: number;
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
  parentLocations: initialParentLocations = [],
  initialChildAvenues = [],
  initialChildSocieties = [],
}: {
  initialPages: SeoPageItem[];
  initialStats: Stats;
  categories: { id: number; title: string }[];
  services: { id: number; category_id: number; title: string }[];
  locations: LocationOption[];
  zones?: ZoneOption[];
  parentLocations?: ParentLocationItem[];
  initialChildAvenues?: ChildAvenueItem[];
  initialChildSocieties?: ChildSocietyItem[];
}) {
  // Navigation tabs: 'pages' | 'parents' | 'avenues' | 'societies'
  const [activeTab, setActiveTab] = useState<"pages" | "parents" | "avenues" | "societies">("pages");

  // Core Data Lists
  const [pages, setPages] = useState<SeoPageItem[]>(initialPages);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [parentLocations, setParentLocations] = useState<ParentLocationItem[]>(initialParentLocations);
  const [childAvenues, setChildAvenues] = useState<ChildAvenueItem[]>(initialChildAvenues);
  const [childSocieties, setChildSocieties] = useState<ChildSocietyItem[]>(initialChildSocieties);

  // Filters for SEO Pages
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [indexFilter, setIndexFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [pageTypeFilter, setPageTypeFilter] = useState("all");
  const [parentLocationFilter, setParentLocationFilter] = useState("all");

  // Filter for Avenues/Societies tab
  const [tabParentFilter, setTabParentFilter] = useState("all");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const isFirstMount = useRef(true);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activePage, setActivePage] = useState<Partial<SeoPageItem> | null>(null);

  // Parent Location Modal State
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<Partial<ParentLocationItem> | null>(null);

  // Child Avenue Modal State
  const [isAvenueModalOpen, setIsAvenueModalOpen] = useState(false);
  const [activeAvenue, setActiveAvenue] = useState<Partial<ChildAvenueItem> | null>(null);

  // Child Society Modal State
  const [isSocietyModalOpen, setIsSocietyModalOpen] = useState(false);
  const [activeSociety, setActiveSociety] = useState<Partial<ChildSocietyItem> | null>(null);

  // Bulk Generator State
  const [bulkParentId, setBulkParentId] = useState<string>(parentLocations[0]?.id ? String(parentLocations[0].id) : "");
  const [bulkServiceId, setBulkServiceId] = useState<string>("");
  const [bulkCategoryId, setBulkCategoryId] = useState<string>(categories[0]?.id ? String(categories[0].id) : "");
  const [bulkLocationsText, setBulkLocationsText] = useState("1st Avenue, 2nd Avenue, 10th Avenue, White Orchid, Gaur Smart Homes");
  const [bulkStatus, setBulkStatus] = useState<"published" | "draft">("published");
  const [bulkIndexable, setBulkIndexable] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Toast feedback helper
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

  // Re-fetch SEO pages via Server Action
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
          parent_location_id: parentLocationFilter,
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

  // Re-fetch parent locations, avenues, societies
  const refreshHierarchy = async () => {
    try {
      const pRes = await getParentLocations();
      if (pRes.success) setParentLocations(pRes.parents as ParentLocationItem[]);

      const aRes = await getChildAvenues();
      if (aRes.success) setChildAvenues(aRes.avenues as ChildAvenueItem[]);

      const sRes = await getChildSocieties();
      if (sRes.success) setChildSocieties(sRes.societies as ChildSocietyItem[]);
    } catch (e) {
      console.error("Error refreshing hierarchy:", e);
    }
  };

  // Debounced search / filter trigger
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      refreshPages();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, indexFilter, categoryFilter, zoneFilter, pageTypeFilter, parentLocationFilter]);

  // Available Avenues filtered by selected parent in active editor
  const availableAvenuesForEditor = useMemo(() => {
    if (!activePage?.parent_location_id) return [];
    return childAvenues.filter((a) => a.parent_location_id === Number(activePage.parent_location_id));
  }, [childAvenues, activePage?.parent_location_id]);

  // Available Societies filtered by selected parent in active editor
  const availableSocietiesForEditor = useMemo(() => {
    if (!activePage?.parent_location_id) return [];
    return childSocieties.filter((s) => s.parent_location_id === Number(activePage.parent_location_id));
  }, [childSocieties, activePage?.parent_location_id]);

  // Available Services filtered by selected category in active editor
  const availableServicesForEditor = useMemo(() => {
    if (!activePage?.category_id) return services;
    return services.filter((s) => s.category_id === Number(activePage.category_id));
  }, [services, activePage?.category_id]);

  // Auto-generator helper when creating a new page
  const generatePageMetadataFromSelection = (page: Partial<SeoPageItem>) => {
    const parent = parentLocations.find((p) => p.id === Number(page.parent_location_id));
    const avenue = childAvenues.find((a) => a.id === Number(page.child_avenue_id));
    const society = childSocieties.find((s) => s.id === Number(page.child_society_id));
    const cat = categories.find((c) => c.id === Number(page.category_id));
    const svc = services.find((s) => s.id === Number(page.service_id));

    const pageType = page.page_type || "service";
    const cityName = parent?.city || page.city || "Ghaziabad";
    const serviceName = svc?.title || cat?.title || "Home Appliance Repair";

    let locationLabel = "";
    let slugPath = "";

    if (pageType === "location") {
      locationLabel = parent?.name || "Indirapuram";
      slugPath = parent?.slug || "indirapuram";
    } else if (pageType === "avenue") {
      locationLabel = avenue ? `${avenue.name}, ${parent?.name || "Indirapuram"}` : (parent ? `Avenue, ${parent.name}` : "10th Avenue, Gaur City 2");
      slugPath = parent && avenue ? `${parent.slug}/${avenue.slug}` : (avenue?.slug || "10th-avenue");
    } else if (pageType === "society") {
      locationLabel = society ? `${society.name}, ${parent?.name || "Indirapuram"}` : (parent ? `Society, ${parent.name}` : "White Orchid, Gaur City 2");
      slugPath = parent && society ? `${parent.slug}/${society.slug}` : (society?.slug || "white-orchid");
    } else {
      // Standard service page
      const locTarget = society ? society.name : avenue ? avenue.name : parent ? parent.name : (page.area || "Indirapuram");
      locationLabel = `${locTarget}, ${cityName}`;

      const cleanSvcSlug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (society && parent) {
        slugPath = `${parent.slug}/${society.slug}/${cleanSvcSlug}`;
      } else if (avenue && parent) {
        slugPath = `${parent.slug}/${avenue.slug}/${cleanSvcSlug}`;
      } else if (parent) {
        slugPath = `${cleanSvcSlug}-${parent.slug}`;
      } else {
        slugPath = `${cleanSvcSlug}-${locTarget.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      }
    }

    const title = pageType === "service"
      ? `${serviceName} in ${locationLabel}`
      : `Doorstep Appliance Repair in ${locationLabel}`;

    const h1 = pageType === "service"
      ? `${serviceName} in ${locationLabel}`
      : `Doorstep Appliance Repair in ${locationLabel}`;

    const h2 = `Why Choose OMAA Experts in ${locationLabel}?`;
    const h3 = `Genuine Spare Parts & Certified Technicians with 30-Day Warranty`;

    const metaTitle = `${title} | Call 9999251966`;
    const metaDesc = `Doorstep ${serviceName.toLowerCase()} in ${locationLabel}. Certified local technicians, same-day service within 60–90 minutes, upfront pricing & 30-day warranty. Call 9999251966.`;

    const canonical = `/${slugPath.replace(/^\/+/, "")}`;

    return {
      title,
      slug: slugPath,
      h1,
      h2,
      h3,
      meta_title: metaTitle,
      meta_description: metaDesc,
      canonical_url: canonical,
      subheading: `Verified doorstep service in ${locationLabel} with 30-day service warranty and manufacturer spares.`,
      content: `OMAA Company offers reliable, fast, and transparent doorstep appliance repair in ${locationLabel}. Our certified technicians arrive within 60 to 90 minutes equipped with genuine spares and advanced diagnostics.`,
    };
  };

  // Open Create Page Modal with default selections
  const handleOpenCreatePage = () => {
    const defaultParent = parentLocations[0];
    const defaultZone = zones.find((z) => z.id === defaultParent?.zone_id) || zones[0];
    const defaultCat = categories[0];

    const initialData: Partial<SeoPageItem> = {
      page_type: "service",
      zone_id: defaultZone ? defaultZone.id : null,
      city: defaultParent?.city || "Greater Noida West",
      parent_location_id: defaultParent?.id || null,
      parent_id: defaultParent?.id || null,
      child_avenue_id: null,
      child_society_id: null,
      category_id: defaultCat?.id || null,
      service_id: null,
      status: "published",
      is_active: 1,
      is_indexable: 0,
      priority: 0.85,
      changefreq: "weekly",
      faqs: [
        {
          question: `How fast can a technician reach Gaur City 2?`,
          answer: `Most bookings in Gaur City 2 receive a verified technician at their doorstep within 60-90 minutes.`,
        },
        {
          question: `Is there a warranty on repairs?`,
          answer: `Yes, all repairs include an official 30-day service warranty and brand-certified spare parts.`,
        },
      ],
    };

    const generated = generatePageMetadataFromSelection(initialData);

    setActivePage({
      ...initialData,
      ...generated,
    });
    setIsEditorOpen(true);
  };

  // Open Edit Page Modal
  const handleOpenEditPage = (page: SeoPageItem) => {
    setActivePage({
      ...page,
      parent_location_id: page.parent_location_id || page.parent_id || null,
      faqs: Array.isArray(page.faqs) && page.faqs.length > 0 ? page.faqs : [],
    });
    setIsEditorOpen(true);
  };

  // Duplicate Page
  const handleDuplicatePage = async (page: SeoPageItem) => {
    startTransition(async () => {
      try {
        const res = await duplicateSeoPage(page.id);
        if (res.success) {
          showToast(res.message || "Page duplicated as Draft!");
          refreshPages();
        } else {
          showToast(res.error || "Failed to duplicate", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Save Page (Create or Update)
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

  // Delete Page
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

  // Toggle Page Status
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

  // Toggle Indexable
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

  // Bulk Generator
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
          parent_location_id: bulkParentId ? Number(bulkParentId) : null,
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

  // -------------------------------------------------------------
  // PARENT LOCATION CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenParentModal = (parent?: ParentLocationItem) => {
    if (parent) {
      setActiveParent({ ...parent });
    } else {
      setActiveParent({
        name: "",
        slug: "",
        zone_id: zones[0]?.id || null,
        city: "Greater Noida West",
        description: "",
        status: "Active",
      });
    }
    setIsParentModalOpen(true);
  };

  const handleSaveParent = async () => {
    if (!activeParent?.name?.trim()) {
      showToast("Parent Location Name is required", "error");
      return;
    }
    startTransition(async () => {
      try {
        const res = await saveParentLocation(activeParent as any);
        if (res.success) {
          showToast(res.message || "Parent Location saved!");
          setIsParentModalOpen(false);
          setActiveParent(null);
          await refreshHierarchy();
          refreshPages();
        } else {
          showToast(res.error || "Failed to save Parent Location", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const handleDeleteParent = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete Parent Location "${name}"?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteParentLocation(id);
        if (res.success) {
          showToast(res.message || "Parent Location deleted");
          await refreshHierarchy();
          refreshPages();
        } else {
          showToast(res.error || "Failed to delete", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // -------------------------------------------------------------
  // CHILD AVENUE CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAvenueModal = (avenue?: ChildAvenueItem) => {
    if (avenue) {
      setActiveAvenue({ ...avenue });
    } else {
      const defaultPid = tabParentFilter !== "all" ? Number(tabParentFilter) : parentLocations[0]?.id || 1;
      setActiveAvenue({
        parent_location_id: defaultPid,
        name: "",
        slug: "",
        description: "",
        status: "Active",
      });
    }
    setIsAvenueModalOpen(true);
  };

  const handleSaveAvenue = async () => {
    if (!activeAvenue?.name?.trim()) {
      showToast("Avenue Name is required", "error");
      return;
    }
    if (!activeAvenue?.parent_location_id) {
      showToast("Parent Location is required", "error");
      return;
    }
    startTransition(async () => {
      try {
        const res = await saveChildAvenue(activeAvenue as any);
        if (res.success) {
          showToast(res.message || "Child Avenue saved!");
          setIsAvenueModalOpen(false);
          setActiveAvenue(null);
          await refreshHierarchy();
        } else {
          showToast(res.error || "Failed to save Child Avenue", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const handleDeleteAvenue = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete Child Avenue "${name}"?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteChildAvenue(id);
        if (res.success) {
          showToast(res.message || "Child Avenue deleted");
          await refreshHierarchy();
        } else {
          showToast(res.error || "Failed to delete", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // -------------------------------------------------------------
  // CHILD SOCIETY CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenSocietyModal = (society?: ChildSocietyItem) => {
    if (society) {
      setActiveSociety({ ...society });
    } else {
      const defaultPid = tabParentFilter !== "all" ? Number(tabParentFilter) : parentLocations[0]?.id || 1;
      setActiveSociety({
        parent_location_id: defaultPid,
        child_avenue_id: null,
        name: "",
        slug: "",
        description: "",
        status: "Active",
      });
    }
    setIsSocietyModalOpen(true);
  };

  const handleSaveSociety = async () => {
    if (!activeSociety?.name?.trim()) {
      showToast("Society Name is required", "error");
      return;
    }
    if (!activeSociety?.parent_location_id) {
      showToast("Parent Location is required", "error");
      return;
    }
    startTransition(async () => {
      try {
        const res = await saveChildSociety(activeSociety as any);
        if (res.success) {
          showToast(res.message || "Child Society saved!");
          setIsSocietyModalOpen(false);
          setActiveSociety(null);
          await refreshHierarchy();
        } else {
          showToast(res.error || "Failed to save Child Society", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const handleDeleteSociety = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete Child Society "${name}"?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteChildSociety(id);
        if (res.success) {
          showToast(res.message || "Child Society deleted");
          await refreshHierarchy();
        } else {
          showToast(res.error || "Failed to delete", "error");
        }
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Filtered Avenues for the Avenue tab
  const filteredTabAvenues = useMemo(() => {
    if (tabParentFilter === "all") return childAvenues;
    return childAvenues.filter((a) => a.parent_location_id === Number(tabParentFilter));
  }, [childAvenues, tabParentFilter]);

  // Filtered Societies for the Society tab
  const filteredTabSocieties = useMemo(() => {
    if (tabParentFilter === "all") return childSocieties;
    return childSocieties.filter((s) => s.parent_location_id === Number(tabParentFilter));
  }, [childSocieties, tabParentFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-4 ${
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
              <span>OMAA Dynamic Parent-Child SEO Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dynamic SEO Page & Location Hierarchy
            </h1>
            <p className="mt-1.5 text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Manage multi-level location-wise organic ranking pages: <strong>Parent Locations</strong> (Gaur City 2, Gaur City 1, Noida Extension) → <strong>Child Avenues</strong> (1st to 16th Avenue) → <strong>Child Societies</strong> (White Orchid, Divyansh Flora) → <strong>Service Landing Pages</strong> with H1/H2/H3, FAQ schemas, and Call/WhatsApp CTAs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Bulk Generator</span>
            </button>

            <button
              onClick={handleOpenCreatePage}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dynamic SEO Page</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "pages"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>SEO Landing Pages ({stats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab("parents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "parents"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Parent Locations ({parentLocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("avenues")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "avenues"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Child Avenues ({childAvenues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("societies")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "societies"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Building className="w-4 h-4 text-purple-600" />
            <span>Child Societies ({childSocieties.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SEO PAGES TABLE & CONTROLS */}
      {/* ========================================================================= */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Pages</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Published Live</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.published}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Drafts</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.draft}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Google Indexable</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{stats.indexable}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Noindex (Safe)</span>
              <span className="text-2xl font-black text-slate-600 mt-1 block">{stats.noindex}</span>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Title, URL, H1, Locality, Sector, City..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshPages}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-indigo-600" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              {/* Page Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hierarchy Type</label>
                <select
                  value={pageTypeFilter}
                  onChange={(e) => setPageTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="location">Parent Location</option>
                  <option value="avenue">Child Avenue</option>
                  <option value="society">Child Society</option>
                  <option value="service">Standard Service</option>
                </select>
              </div>

              {/* Parent Location Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parent Location</label>
                <select
                  value={parentLocationFilter}
                  onChange={(e) => setParentLocationFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Parent Locations</option>
                  {parentLocations.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Zone Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Zone</label>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Service Zones</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status & Index</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published Live</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO Pages Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Page Title & Live URL</th>
                    <th className="px-4 py-3.5">Hierarchy & Type</th>
                    <th className="px-4 py-3.5">Service / Category</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Google Index</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <span className="font-semibold block">No SEO pages match your filters</span>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Try resetting search terms or click "Create Dynamic SEO Page"
                        </span>
                      </td>
                    </tr>
                  ) : (
                    pages.map((p) => {
                      const parent = parentLocations.find((pl) => pl.id === p.parent_location_id || pl.id === p.parent_id);
                      const avenue = childAvenues.find((ca) => ca.id === p.child_avenue_id);
                      const society = childSocieties.find((cs) => cs.id === p.child_society_id);
                      const cat = categories.find((c) => c.id === p.category_id);

                      return (
                        <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                          {/* Title & URL */}
                          <td className="px-4 py-3 max-w-sm">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 truncate max-w-[280px]"
                              >
                                <span>{p.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                              <button
                                onClick={() => copyUrl(p.url, p.id)}
                                title="Copy Full URL"
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Hierarchy & Type */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  p.page_type === "location"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : p.page_type === "avenue"
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : p.page_type === "society"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}
                              >
                                {p.page_type === "location"
                                  ? "Parent Location"
                                  : p.page_type === "avenue"
                                  ? "Child Avenue"
                                  : p.page_type === "society"
                                  ? "Child Society"
                                  : "Standard Service"}
                              </span>

                              {parent && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  under <strong className="text-slate-700">{parent.name}</strong>
                                  {avenue ? ` > ${avenue.name}` : society ? ` > ${society.name}` : ""}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category / Service */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">
                              {cat?.title || (p.category_id ? `Category #${p.category_id}` : "General Repair")}
                            </div>
                            <div className="text-[11px] text-slate-500">{p.city || "Delhi NCR"}</div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(p)}
                              title="Click to toggle Published / Draft"
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                                p.status === "published"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              <span className="capitalize">{p.status}</span>
                            </button>
                          </td>

                          {/* Google Index */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleIndexable(p)}
                              title="Click to toggle Index / Noindex in Google"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                                p.is_indexable
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {p.is_indexable ? (
                                <>
                                  <Check className="w-3 h-3 text-indigo-600" />
                                  <span>Index in Google</span>
                                </>
                              ) : (
                                <span>Noindex</span>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview */}
                              <button
                                onClick={() => {
                                  setActivePage(p);
                                  setIsPreviewOpen(true);
                                }}
                                title="Preview Page Template"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditPage(p)}
                                title="Edit Page"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Duplicate Page */}
                              <button
                                onClick={() => handleDuplicatePage(p)}
                                title="Duplicate Page as Draft"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeletePage(p.id, p.title)}
                                title="Delete Page"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PARENT LOCATIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "parents" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Parent Locations Management</h2>
              <p className="text-xs text-slate-500">
                Define master hubs like Gaur City 2, Gaur City 1, Noida Extension. All child avenues, societies, and service SEO pages nest under these parents.
              </p>
            </div>
            <button
              onClick={() => handleOpenParentModal()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Parent Location</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parentLocations.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Parent Hub
                    </span>
                    <span className={`text-[10px] font-bold ${p.status === "Active" ? "text-emerald-600" : "text-slate-400"}`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{p.name}</h3>
                  <div className="font-mono text-xs text-emerald-700 font-semibold mt-0.5">/{p.slug}</div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {p.description || `All avenues and residential societies located in ${p.name}, ${p.city}.`}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">Avenues</span>
                      <span className="text-sm font-bold text-slate-800">{p.avenues_count || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">Societies</span>
                      <span className="text-sm font-bold text-slate-800">{p.societies_count || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">SEO Pages</span>
                      <span className="text-sm font-bold text-indigo-700">{p.pages_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <a
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View Hub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenParentModal(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                      title="Edit Parent Location"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteParent(p.id, p.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Parent Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHILD AVENUES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "avenues" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Child Avenues Management</h2>
              <p className="text-xs text-slate-500">
                Avenues linked strictly to their Parent Location. Gaur City 2 has 1st–16th Avenue; Gaur City 1 has its own separate avenues.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={tabParentFilter}
                onChange={(e) => setTabParentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="all">All Parent Locations</option>
                {parentLocations.map((p) => (
                  <option key={p.id} value={p.id}>
                    Filter by {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleOpenAvenueModal()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Child Avenue</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Avenue Name & Dynamic URL</th>
                  <th className="px-4 py-3.5">Parent Location</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Linked SEO Pages</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTabAvenues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No avenues found for this parent location.
                    </td>
                  </tr>
                ) : (
                  filteredTabAvenues.map((a) => (
                    <tr key={a.id} className="hover:bg-sky-50/30 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{a.name}</span>
                        <span className="font-mono text-[11px] text-sky-700">
                          /{a.parent_slug}/{a.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {a.parent_name} ({a.city})
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-700">
                        {a.pages_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAvenueModal(a)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAvenue(a.id, a.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CHILD SOCIETIES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "societies" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Child Societies Management</h2>
              <p className="text-xs text-slate-500">
                Residential societies linked strictly to their Parent Location (e.g. White Orchid, Palm Olympia under Gaur City 2).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={tabParentFilter}
                onChange={(e) => setTabParentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="all">All Parent Locations</option>
                {parentLocations.map((p) => (
                  <option key={p.id} value={p.id}>
                    Filter by {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleOpenSocietyModal()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Child Society</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Society Name & Dynamic URL</th>
                  <th className="px-4 py-3.5">Parent Location</th>
                  <th className="px-4 py-3.5">Avenue (Optional)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Linked SEO Pages</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTabSocieties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No societies found for this parent location.
                    </td>
                  </tr>
                ) : (
                  filteredTabSocieties.map((s) => (
                    <tr key={s.id} className="hover:bg-purple-50/30 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="font-mono text-[11px] text-purple-700">
                          /{s.parent_slug}/{s.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {s.parent_name} ({s.city})
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.avenue_name || "Direct under Parent"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-700">
                        {s.pages_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenSocietyModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSociety(s.id, s.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SEO PAGE CREATOR & EDITOR (ALL 21 FIELDS + CASCADING DROPDOWNS) */}
      {/* ========================================================================= */}
      {isEditorOpen && activePage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {activePage.id ? "Edit Dynamic SEO Page" : "Create Dynamic Hierarchy SEO Page"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Step-by-step cascading configuration for high-ranking service and location landing pages.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ------------------------------------------------------------- */}
              {/* STEP 1 TO STEP 6: DYNAMIC CASCADING HIERARCHY SELECTOR */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Location Hierarchy & Dynamic Cascading (Steps 1–6)</span>
                  </span>
                  <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                    Auto-Filters Child Locations
                  </span>
                </div>

                {/* Row 1: Page Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    1. Page Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={activePage.page_type || "service"}
                    onChange={(e) => {
                      const nextType = e.target.value as "location" | "avenue" | "society" | "service";
                      setActivePage((prev) => {
                        const updated = {
                          ...prev,
                          page_type: nextType,
                          // clear avenue / society if page type is location
                          child_avenue_id: nextType === "location" ? null : prev?.child_avenue_id,
                          child_society_id: nextType === "location" ? null : prev?.child_society_id,
                        };
                        const autoGen = generatePageMetadataFromSelection(updated);
                        return { ...updated, ...autoGen };
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="service">A. Standard Service Page (e.g. RO Repair in Gaur City 2 / 10th Avenue / White Orchid)</option>
                    <option value="location">B. Parent Location Page (e.g. Gaur City 2, Gaur City 1, Noida Extension)</option>
                    <option value="avenue">C. Child Avenue Page (e.g. 10th Avenue under Gaur City 2)</option>
                    <option value="society">D. Child Society Page (e.g. White Orchid under Gaur City 2)</option>
                  </select>
                </div>

                {/* Row 2: Service Zone (Step 1) & City / Region (Step 2) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Step 1: Service Zone (Admin Zone)</span>
                    </label>
                    <select
                      value={activePage.zone_id || ""}
                      onChange={(e) => {
                        const nextZoneId = e.target.value ? Number(e.target.value) : null;
                        const matchedZone = zones.find((z) => z.id === nextZoneId);
                        const zoneParents = parentLocations.filter((p) => p.zone_id === nextZoneId);
                        const autoParent = zoneParents.length === 1 ? zoneParents[0] : null;

                        setActivePage((prev) => {
                          const updated = {
                            ...prev,
                            zone_id: nextZoneId,
                            city: autoParent ? autoParent.city : (matchedZone ? (matchedZone.city_names?.split(",")[0]?.trim() || "Ghaziabad") : prev?.city),
                            parent_location_id: autoParent ? autoParent.id : (prev?.parent_location_id && zoneParents.some(p => p.id === prev.parent_location_id) ? prev.parent_location_id : null),
                            parent_id: autoParent ? autoParent.id : (prev?.parent_id && zoneParents.some(p => p.id === prev.parent_id) ? prev.parent_id : null),
                            child_avenue_id: null,
                            child_society_id: null,
                          };
                          const autoGen = generatePageMetadataFromSelection(updated);
                          return { ...updated, ...autoGen };
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- Select Service Zone --</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Step 2: City / Region
                    </label>
                    <input
                      type="text"
                      value={activePage.city || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Ghaziabad, Greater Noida West, Noida, Delhi"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Row 3: Parent Location (Step 3) - CASCADING CORE */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Step 3: Parent Location <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Changing parent automatically clears old avenue/society
                    </span>
                  </label>
                  <select
                    value={activePage.parent_location_id || activePage.parent_id || ""}
                    onChange={(e) => {
                      const nextParentId = e.target.value ? Number(e.target.value) : null;
                      const selectedParent = parentLocations.find((p) => p.id === nextParentId);

                      setActivePage((prev) => {
                        // CRITICAL: Changing parent automatically clears avenue and society!
                        const updated = {
                          ...prev,
                          parent_location_id: nextParentId,
                          parent_id: nextParentId,
                          child_avenue_id: null,
                          child_society_id: null,
                          zone_id: selectedParent?.zone_id || prev?.zone_id,
                          city: selectedParent?.city || prev?.city,
                        };
                        const autoGen = generatePageMetadataFromSelection(updated);
                        return { ...updated, ...autoGen };
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">-- Select Parent Location --</option>
                    {activePage.zone_id && parentLocations.some((p) => p.zone_id === activePage.zone_id) ? (
                      <>
                        <optgroup label="Locations in Selected Zone">
                          {parentLocations
                            .filter((p) => p.zone_id === activePage.zone_id)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.city}) - /{p.slug}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Other Locations">
                          {parentLocations
                            .filter((p) => p.zone_id !== activePage.zone_id)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.city}) - /{p.slug}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    ) : (
                      parentLocations.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city}) - /{p.slug}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Row 4: Child Avenue (Step 4) & Child Society (Step 5) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Step 4: Child Avenue */}
                  <div className={activePage.page_type === "location" ? "opacity-40 pointer-events-none" : ""}>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Step 4: Child Avenue</span>
                      <span className="text-[10px] text-sky-600 font-semibold">
                        {availableAvenuesForEditor.length} in selected parent
                      </span>
                    </label>
                    <select
                      value={activePage.child_avenue_id || ""}
                      disabled={!activePage.parent_location_id || activePage.page_type === "location"}
                      onChange={(e) => {
                        const nextAvenueId = e.target.value ? Number(e.target.value) : null;
                        setActivePage((prev) => {
                          const updated = {
                            ...prev,
                            child_avenue_id: nextAvenueId,
                          };
                          const autoGen = generatePageMetadataFromSelection(updated);
                          return { ...updated, ...autoGen };
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 disabled:bg-slate-100"
                    >
                      <option value="">-- Select Child Avenue (Optional / Filtered) --</option>
                      {availableAvenuesForEditor.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {availableAvenuesForEditor.length === 0 && activePage.parent_location_id && (
                      <span className="text-[10px] text-amber-600 mt-1 block">
                        No avenues registered under this parent yet. Add from Child Avenues tab.
                      </span>
                    )}
                  </div>

                  {/* Step 5: Child Society */}
                  <div className={activePage.page_type === "location" ? "opacity-40 pointer-events-none" : ""}>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Step 5: Child Society</span>
                      <span className="text-[10px] text-purple-600 font-semibold">
                        {availableSocietiesForEditor.length} in selected parent
                      </span>
                    </label>
                    <select
                      value={activePage.child_society_id || ""}
                      disabled={!activePage.parent_location_id || activePage.page_type === "location"}
                      onChange={(e) => {
                        const nextSocietyId = e.target.value ? Number(e.target.value) : null;
                        setActivePage((prev) => {
                          const updated = {
                            ...prev,
                            child_society_id: nextSocietyId,
                          };
                          const autoGen = generatePageMetadataFromSelection(updated);
                          return { ...updated, ...autoGen };
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 disabled:bg-slate-100"
                    >
                      <option value="">-- Select Child Society (Optional / Filtered) --</option>
                      {availableSocietiesForEditor.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {availableSocietiesForEditor.length === 0 && activePage.parent_location_id && (
                      <span className="text-[10px] text-amber-600 mt-1 block">
                        No societies registered under this parent yet. Add from Child Societies tab.
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 5: Associated Service / Category (Step 6) */}
                <div className={`grid sm:grid-cols-2 gap-4 ${activePage.page_type !== "service" ? "opacity-40 pointer-events-none" : ""}`}>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Step 6: Associated Service Category</span>
                    </label>
                    <select
                      value={activePage.category_id || ""}
                      onChange={(e) => {
                        const nextCatId = e.target.value ? Number(e.target.value) : null;
                        setActivePage((prev) => {
                          const updated = {
                            ...prev,
                            category_id: nextCatId,
                            service_id: null,
                          };
                          const autoGen = generatePageMetadataFromSelection(updated);
                          return { ...updated, ...autoGen };
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- Select Service Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Specific Service (Optional)
                    </label>
                    <select
                      value={activePage.service_id || ""}
                      onChange={(e) => {
                        const nextSvcId = e.target.value ? Number(e.target.value) : null;
                        setActivePage((prev) => {
                          const updated = {
                            ...prev,
                            service_id: nextSvcId,
                          };
                          const autoGen = generatePageMetadataFromSelection(updated);
                          return { ...updated, ...autoGen };
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- All Services in Category --</option>
                      {availableServicesForEditor.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live URL Preview Bar */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-xs gap-2">
                  <div className="flex items-center gap-2 truncate flex-1">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-500 shrink-0">Dynamic Live URL:</span>
                    <span className="font-mono text-emerald-700 font-bold truncate">
                      https://omaacompany.com/{String(activePage.slug || "").replace(/^\/+/, "")}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Live Catch-All Route Ready
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 7: TITLES, SLUGS & EDITABLE URLS */}
              {/* ------------------------------------------------------------- */}
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
                      setActivePage((prev) => ({
                        ...prev,
                        title: newTitle,
                        h1: prev?.h1 === prev?.title ? newTitle : prev?.h1,
                        meta_title: prev?.meta_title === prev?.title ? `${newTitle} | Call 9999251966` : prev?.meta_title,
                      }));
                    }}
                    placeholder="e.g. RO Water Purifier Repair in Gaur City 2, 10th Avenue"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      URL Slug / Custom Path <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Supports custom direct paths</span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      value={activePage.slug || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, slug: e.target.value.replace(/^\/+/, "") }))}
                      placeholder="e.g. gaur-city-2/10th-avenue/ro-repair"
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Headings (H1, H2, H3) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Heading Structure</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H1 Main Heading</label>
                    <input
                      type="text"
                      value={activePage.h1 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h1: e.target.value }))}
                      placeholder="e.g. RO Repair in Gaur City 2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H2 Section Heading</label>
                    <input
                      type="text"
                      value={activePage.h2 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h2: e.target.value }))}
                      placeholder="e.g. Why Choose OMAA Experts?"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">H3 Subsection</label>
                    <input
                      type="text"
                      value={activePage.h3 || ""}
                      onChange={(e) => setActivePage((prev) => ({ ...prev, h3: e.target.value }))}
                      placeholder="e.g. 100% Genuine Manufacturer Spares"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Meta Information (SERP Preview) */}
              <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Google Search Metadata</span>
                  <span className="text-[11px] text-slate-500">Live SERP Preview</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Meta Title</span>
                    <span className={(activePage.meta_title?.length || 0) > 60 ? "text-amber-600 font-bold" : "text-slate-400"}>
                      {activePage.meta_title?.length || 0} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={activePage.meta_title || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Page Title shown in search engines"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Meta Description</span>
                    <span className={(activePage.meta_description?.length || 0) > 160 ? "text-amber-600 font-bold" : "text-slate-400"}>
                      {activePage.meta_description?.length || 0} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activePage.meta_description || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description shown in Google search results"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>

                {/* Google Snippet Live Box */}
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] text-emerald-700 font-mono">
                    https://omaacompany.com/{activePage.slug || "slug"}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                    {activePage.meta_title || activePage.title || "Page Title"}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {activePage.meta_description || "Doorstep home appliance repair in Delhi NCR with 30-day warranty."}
                  </div>
                </div>
              </div>

              {/* SEO Content Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Content Body
                </label>
                <textarea
                  rows={4}
                  value={activePage.content || ""}
                  onChange={(e) => setActivePage((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed SEO description, symptoms fixed, reasons to choose OMAA technicians..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* FAQ Management */}
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
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove question"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status, Indexing & Canonical URL */}
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
                    <option value="0">Noindex (Recommended during staging)</option>
                    <option value="1">Index in Google (Included in Sitemap.xml)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={activePage.canonical_url || ""}
                    onChange={(e) => setActivePage((prev) => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="e.g. /gaur-city-2/10th-avenue"
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

      {/* ========================================================================= */}
      {/* MODAL: PARENT LOCATION ADD / EDIT */}
      {/* ========================================================================= */}
      {isParentModalOpen && activeParent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeParent.id ? "Edit Parent Location" : "Add New Parent Location"}
                </h3>
              </div>
              <button onClick={() => setIsParentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeParent.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setActiveParent((prev) => ({
                      ...prev,
                      name,
                      slug: !prev?.id ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : prev?.slug,
                    }));
                  }}
                  placeholder="e.g. Gaur City 2, Noida Extension"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeParent.slug || ""}
                  onChange={(e) => setActiveParent((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. gaur-city-2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Zone</label>
                  <select
                    value={activeParent.zone_id || ""}
                    onChange={(e) => setActiveParent((prev) => ({ ...prev, zone_id: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="">-- Select Zone --</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Region</label>
                  <input
                    type="text"
                    value={activeParent.city || ""}
                    onChange={(e) => setActiveParent((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Greater Noida West"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={activeParent.description || ""}
                  onChange={(e) => setActiveParent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description for this master hub..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={activeParent.status || "Active"}
                  onChange={(e) => setActiveParent((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsParentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveParent}
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save Parent Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHILD AVENUE ADD / EDIT */}
      {/* ========================================================================= */}
      {isAvenueModalOpen && activeAvenue && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeAvenue.id ? "Edit Child Avenue" : "Add Child Avenue"}
                </h3>
              </div>
              <button onClick={() => setIsAvenueModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={activeAvenue.parent_location_id || ""}
                  onChange={(e) => setActiveAvenue((prev) => ({ ...prev, parent_location_id: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="">-- Select Parent Location --</option>
                  {parentLocations.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Avenue Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeAvenue.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setActiveAvenue((prev) => ({
                      ...prev,
                      name,
                      slug: !prev?.id ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : prev?.slug,
                    }));
                  }}
                  placeholder="e.g. 10th Avenue"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeAvenue.slug || ""}
                  onChange={(e) => setActiveAvenue((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. 10th-avenue"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={activeAvenue.status || "Active"}
                  onChange={(e) => setActiveAvenue((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAvenueModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvenue}
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
              >
                Save Child Avenue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHILD SOCIETY ADD / EDIT */}
      {/* ========================================================================= */}
      {isSocietyModalOpen && activeSociety && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeSociety.id ? "Edit Child Society" : "Add Child Society"}
                </h3>
              </div>
              <button onClick={() => setIsSocietyModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={activeSociety.parent_location_id || ""}
                  onChange={(e) => setActiveSociety((prev) => ({ ...prev, parent_location_id: Number(e.target.value), child_avenue_id: null }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="">-- Select Parent Location --</option>
                  {parentLocations.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Society Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeSociety.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setActiveSociety((prev) => ({
                      ...prev,
                      name,
                      slug: !prev?.id ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : prev?.slug,
                    }));
                  }}
                  placeholder="e.g. White Orchid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activeSociety.slug || ""}
                  onChange={(e) => setActiveSociety((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. white-orchid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Within Avenue (Optional)
                </label>
                <select
                  value={activeSociety.child_avenue_id || ""}
                  onChange={(e) => setActiveSociety((prev) => ({ ...prev, child_avenue_id: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- Direct under Parent (No specific Avenue) --</option>
                  {childAvenues
                    .filter((a) => a.parent_location_id === activeSociety.parent_location_id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={activeSociety.status || "Active"}
                  onChange={(e) => setActiveSociety((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSocietyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSociety}
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Save Child Society
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE TEMPLATE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isPreviewOpen && activePage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold font-mono">Live Template Preview: /{activePage.slug || "slug"}</span>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
                <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                  Home / {activePage.city || "Greater Noida West"} / {activePage.area || "Gaur City 2"}
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {activePage.h1 || activePage.title}
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  {activePage.subheading || activePage.meta_description}
                </p>

                {/* Call & WhatsApp CTAs */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="tel:+919999251966"
                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
                  >
                    Call Now: 9999251966
                  </a>
                  <a
                    href="https://wa.me/919999251966"
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
                  >
                    WhatsApp Booking
                  </a>
                </div>

                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {activePage.h2 || "Why Choose OMAA Experts?"}
                  </h2>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {activePage.content}
                  </p>
                </div>

                {/* FAQs */}
                {activePage.faqs && activePage.faqs.length > 0 && (
                  <div className="pt-6 border-t border-slate-200 space-y-3">
                    <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
                    <div className="space-y-2">
                      {activePage.faqs.map((f, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="font-bold text-xs text-slate-900">{f.question}</div>
                          <div className="text-xs text-slate-600 mt-1">{f.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK GENERATOR */}
      {/* ========================================================================= */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Bulk Dynamic SEO Page Generator</h3>
              </div>
              <button onClick={() => setIsBulkOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Location</label>
                <select
                  value={bulkParentId}
                  onChange={(e) => setBulkParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- None (Direct Root Area SEO) --</option>
                  {parentLocations.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Category</label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Avenues / Societies / Localities (Comma or newline separated)
                </label>
                <textarea
                  rows={4}
                  value={bulkLocationsText}
                  onChange={(e) => setBulkLocationsText(e.target.value)}
                  placeholder="1st Avenue, 2nd Avenue, 10th Avenue, White Orchid, Gaur Smart Homes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Publish Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Indexing</label>
                  <select
                    value={bulkIndexable ? "1" : "0"}
                    onChange={(e) => setBulkIndexable(e.target.value === "1")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="0">Noindex</option>
                    <option value="1">Index in Google</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                {bulkGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate SEO Pages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
