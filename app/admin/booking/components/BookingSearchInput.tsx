"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function BookingSearchInput({ tableId = "bookingsTable" }: { tableId?: string }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr");

    const q = query.trim().toLowerCase();

    rows.forEach((row) => {
      // If it's the "No bookings found" empty row, ignore
      if (row.querySelector("td[colspan]")) return;

      if (!q) {
        row.style.display = "";
        return;
      }
      const text = row.innerText.toLowerCase();
      if (text.includes(q)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }, [query, tableId]);

  return (
    <div className="relative w-full lg:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 h-4 text-indigo-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by Order ID, Name, Mobile, Category..."
        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-[13px] outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300 transition-all text-gray-900 placeholder:text-gray-400 shadow-xs font-medium"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
