"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Wrench, 
  ShieldCheck, 
  ChevronRight,
  Layers
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
  const [selectedCatId, setSelectedCatId] = useState<number | "all">(
    categories.length > 0 ? categories[0].id : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Categories that actually have rate cards
  const categoriesWithCards = categories.filter((cat) =>
    initialRateCards.some((rc) => rc.category_id === cat.id)
  );

  // Use all categories if none filtered, otherwise the ones with cards
  const activeCategoryList = categoriesWithCards.length > 0 ? categoriesWithCards : categories;

  // Filter items by category & search query
  const filteredRateCards = initialRateCards.filter((item) => {
    const matchesCategory =
      selectedCatId === "all" ? true : item.category_id === Number(selectedCatId);

    const matchesSearch =
      searchQuery.trim() === "" ||
      item.part_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.heading_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Group by Heading (e.g. Electrical Parts, Gas Charging, Fan Motors, etc.)
  const groupedByHeading = filteredRateCards.reduce((acc, item) => {
    const heading = item.heading_title || "General Spare Parts";
    if (!acc[heading]) {
      acc[heading] = [];
    }
    acc[heading].push(item);
    return acc;
  }, {} as Record<string, RateCardItem[]>);

  const selectedCategoryName = 
    selectedCatId === "all" 
      ? "All Categories" 
      : categories.find(c => c.id === selectedCatId)?.title || "Rate Card";

  return (
    <div className="space-y-6">
      
      {/* Top Black Header Banner Matching Screenshot */}
      <div className="bg-[#1c1c1e] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/10 rounded-xl transition text-white flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Rate Card
          </h1>
        </div>

        {/* Search Input in Header */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search spare parts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2c2c2e] text-xs sm:text-sm text-white placeholder-gray-400 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/5"
          />
        </div>
      </div>

      {/* Blue Informational Banner Matching Screenshot */}
      <div className="bg-[#eef4ff] border-l-4 border-[#3b82f6] rounded-xl p-4 sm:p-5 shadow-xs">
        <p className="text-xs sm:text-sm font-semibold text-[#1e40af] mb-1 leading-snug">
          Labour Charges are extra and is capped at ₹199 per appliance.
        </p>
        <p className="text-[11px] sm:text-xs text-[#3b82f6] font-normal leading-relaxed">
          All prices below are inclusive of spare part price, cost of sourcing and partner conveyance. Please do not pay any extra amount for conveyance.
        </p>
      </div>

      {/* Category Selection Tabs / Buttons */}
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCatId("all")}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCatId === "all"
                ? "bg-[#1c1c1e] text-white shadow-sm"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Categories
          </button>

          {activeCategoryList.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#1c1c1e] text-white shadow-sm"
                    : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate Card Category Sections with Exact Black Headings and Tables */}
      <div className="space-y-6">
        {Object.keys(groupedByHeading).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Rate Cards Available</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No spare parts or pricing rate cards found for this selection.
            </p>
          </div>
        ) : (
          Object.entries(groupedByHeading).map(([heading, items]) => (
            <div 
              key={heading}
              className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs"
            >
              {/* Black Section Heading matching screenshot */}
              <div className="bg-[#1c1c1e] px-5 py-3.5 text-white flex items-center justify-between">
                <h2 className="font-bold text-sm sm:text-base tracking-wide text-white">
                  {heading}
                </h2>
                <div className="text-[10px] sm:text-xs text-gray-400 font-mono flex items-center gap-1">
                  <span>{items.length} items</span>
                  <span className="text-gray-500">T</span>
                </div>
              </div>

              {/* Exact Table Layout Matching Screenshot */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 w-[60%] sm:w-[70%] border-r border-gray-100">
                        Description
                      </th>
                      <th className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900">
                        Service Charge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {items.map((item, idx) => (
                      <tr 
                        key={item.id || idx}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Part / Description */}
                        <td className="py-3.5 px-4 sm:px-6 font-medium text-gray-800 border-r border-gray-100">
                          <div className="leading-snug">{item.part_name}</div>
                          {selectedCatId === "all" && item.category_title && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({item.category_title})
                            </span>
                          )}
                        </td>

                        {/* Price matching screenshot (₹1,500 / ₹4,500 / ₹350) */}
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-gray-900">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
