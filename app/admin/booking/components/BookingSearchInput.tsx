"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function BookingSearchInput({ tableId = "bookingsTable" }: { tableId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr");
    const q = query.trim().toLowerCase();

    rows.forEach((row) => {
      if (row.querySelector("td[colspan]")) return;
      if (!q) {
        row.style.display = "";
        return;
      }
      row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  }, [query, tableId]);

  useEffect(() => {
    const current = searchParams.get("q") || "";
    if (query.trim() === current.trim()) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const next = query.trim();
      if (next) params.set("q", next);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative w-full lg:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-indigo-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Order ID, name, mobile..."
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
