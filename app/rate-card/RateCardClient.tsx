"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Wrench, 
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Sparkles
} from "lucide-react";

interface RateCardItem {
  id: number;
  category_id: number;
  category_title?: string;
  heading_id: number;
  heading_title?: string;
  part_name: string;
  price: number | string;
  labour_charges?: number | string;
  labour_note?: string;
}

interface Category {
  id: number;
  title: string;
}

export default function RateCardClient({
  categories,
  initialRateCards
}: {
  categories: Category[];
  initialRateCards: RateCardItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catRefId = searchParams.get("cat_ref_id");

  // Categories that actually have rate cards
  const categoriesWithCards = useMemo(() => {
    return categories.filter((cat) =>
      initialRateCards.some((rc) => rc.category_id === cat.id)
    );
  }, [categories, initialRateCards]);

  const activeCategoryList = categoriesWithCards.length > 0 ? categoriesWithCards : categories;

  const [selectedCatId, setSelectedCatId] = useState<number | "all">(() => {
    if (catRefId) {
      if (catRefId === "all") return "all";
      const num = Number(catRefId);
      if (!isNaN(num)) return num;
    }
    return activeCategoryList.length > 0 ? activeCategoryList[0].id : "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedHeadings, setCollapsedHeadings] = useState<Record<string, boolean>>({});

  const toggleHeading = (heading: string) => {
    setCollapsedHeadings((prev) => ({
      ...prev,
      [heading]: !prev[heading]
    }));
  };

  // Count items across all categories for search discovery
  const allMatchingSearchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return initialRateCards.filter((item) =>
      item.part_name?.toLowerCase().includes(q) ||
      item.heading_title?.toLowerCase().includes(q) ||
      item.category_title?.toLowerCase().includes(q)
    ).length;
  }, [searchQuery, initialRateCards]);

  // Filter items by category & search query
  const filteredRateCards = useMemo(() => {
    return initialRateCards.filter((item) => {
      const matchesCategory =
        selectedCatId === "all" ? true : item.category_id === Number(selectedCatId);

      const matchesSearch =
        searchQuery.trim() === "" ||
        item.part_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.heading_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_title?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialRateCards, selectedCatId, searchQuery]);

  // Group by Heading (e.g. Electrical Parts, Gas Charging, Fan Motors, etc.)
  const groupedByHeading = useMemo(() => {
    return filteredRateCards.reduce((acc, item) => {
      const heading = item.heading_title || "General Spare Parts";
      if (!acc[heading]) {
        acc[heading] = [];
      }
      acc[heading].push(item);
      return acc;
    }, {} as Record<string, RateCardItem[]>);
  }, [filteredRateCards]);

  const toggleAllHeadings = (collapse: boolean) => {
    const nextState: Record<string, boolean> = {};
    Object.keys(groupedByHeading).forEach((h) => {
      nextState[h] = collapse;
    });
    setCollapsedHeadings(nextState);
  };

  const selectedCategoryName = 
    selectedCatId === "all" 
      ? "All Services" 
      : categories.find(c => c.id === selectedCatId)?.title || "Rate Card";

  return (
    <div className="space-y-6">
      
      {/* Top Black Header Banner Matching Design */}
      <div className="bg-[#1c1c1e] text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/10 rounded-xl transition text-white flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Rate Card
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Official transparent spare part & service charges
            </p>
          </div>
        </div>

        {/* Search Input in Header */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search spare parts (e.g. PCB, Motor)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2c2c2e] text-xs sm:text-sm text-white placeholder-gray-400 pl-9 pr-8 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/5"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Blue Informational Banner */}
      <div className="bg-[#eef4ff] border-l-4 border-[#3b82f6] rounded-xl p-4 sm:p-5 shadow-xs">
        <p className="text-xs sm:text-sm font-semibold text-[#1e40af] mb-1 leading-snug">
          Labour Charges are extra and capped at ₹199 per appliance.
        </p>
        <p className="text-[11px] sm:text-xs text-[#3b82f6] font-normal leading-relaxed">
          All prices below are inclusive of spare part price, cost of sourcing and partner conveyance. Please do not pay any extra amount for conveyance.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-gray-600">
            <Layers className="w-3.5 h-3.5 text-[#5c67b8]" />
            Select Appliance Category:
          </span>
          {Object.keys(groupedByHeading).length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAllHeadings(false)}
                className="text-[#5c67b8] hover:underline font-semibold text-[11px]"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => toggleAllHeadings(true)}
                className="text-gray-500 hover:text-gray-800 text-[11px]"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {/* All Services Pill */}
          <button
            onClick={() => setSelectedCatId("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 flex items-center gap-2 ${
              selectedCatId === "all"
                ? "bg-[#1c1c1e] text-white shadow-sm ring-1 ring-black"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:text-black border border-gray-200"
            }`}
          >
            <span>All Services</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                selectedCatId === "all"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {initialRateCards.length}
            </span>
          </button>

          {/* Individual Categories */}
          {activeCategoryList.map((cat) => {
            const count = initialRateCards.filter((rc) => rc.category_id === cat.id).length;
            const isSelected = selectedCatId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#1c1c1e] text-white shadow-sm ring-1 ring-black"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:text-black border border-gray-200"
                }`}
              >
                <span>{cat.title}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpful Search Hint Banner when 0 in current category but found in others */}
      {filteredRateCards.length === 0 && allMatchingSearchCount > 0 && selectedCatId !== "all" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800">
          <span>
            No matching spare parts for <strong>&quot;{searchQuery}&quot;</strong> in <strong>{selectedCategoryName}</strong>. Found <strong>{allMatchingSearchCount}</strong> matching parts in other categories.
          </span>
          <button
            onClick={() => setSelectedCatId("all")}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 ml-3 transition"
          >
            Show in All Services
          </button>
        </div>
      )}

      {/* Rate Card Category Sections with Exact Black Headings and Tables */}
      <div className="space-y-6">
        {Object.keys(groupedByHeading).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Rate Cards Available</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No spare parts or pricing rate cards found matching "${searchQuery}".`
                : "No spare parts or pricing rate cards found for this selection."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-1.5 text-xs font-semibold text-[#5c67b8] border border-[#5c67b8]/30 rounded-lg hover:bg-indigo-50 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedByHeading).map(([heading, items]) => (
            <div 
              key={heading}
              className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs"
            >
              {/* Black Section Heading */}
              <div 
                onClick={() => toggleHeading(heading)}
                className="bg-[#1c1c1e] px-5 py-3.5 text-white flex items-center justify-between cursor-pointer select-none transition hover:bg-[#252528]"
              >
                <div className="flex items-center gap-2.5">
                  <h2 className="font-bold text-sm sm:text-base tracking-wide text-white">
                    {heading}
                  </h2>
                  <span className="text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-full text-gray-300">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white flex items-center justify-center"
                  aria-label={collapsedHeadings[heading] ? "Expand Section" : "Collapse Section"}
                >
                  {collapsedHeadings[heading] ? (
                    <ChevronDown className="w-5 h-5 text-gray-300" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Table Layout */}
              {!collapsedHeadings[heading] && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#23232a] border-b-2 border-[#3a3a45]">
                        <th className="py-3.5 px-5 sm:px-6 text-xs sm:text-sm font-bold text-white w-[65%] sm:w-[75%] border-r-2 border-[#3a3a45]">
                          Description / Part Name
                        </th>
                        <th className="py-3.5 px-5 sm:px-6 text-xs sm:text-sm font-bold text-white">
                          Service Charge
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                      {items.map((item, idx) => (
                        <tr 
                          key={item.id || idx}
                          className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} hover:bg-indigo-50/40`}
                        >
                          {/* Part / Description */}
                          <td className="py-3.5 px-5 sm:px-6 font-medium text-gray-800 border-r-2 border-gray-200">
                            <div className="leading-snug">{item.part_name}</div>
                            {selectedCatId === "all" && item.category_title && (
                              <span className="inline-block mt-0.5 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                                {item.category_title}
                              </span>
                            )}
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-5 sm:px-6 font-bold text-gray-900">
                            <span className="inline-flex items-center gap-0.5">
                              <span className="text-gray-500 text-xs">₹</span>
                              <span className="text-[15px]">{Number(item.price || 0).toLocaleString('en-IN')}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
