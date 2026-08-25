"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LiveSearchBar({ 
  placeholder = "Search for Services ...",
  className = ""
}: { 
  placeholder?: string,
  className?: string
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Typewriter effect state
  const searchTerms = ["AC Repair", "RO AMC", "Refrigerator Repair", "Washing Machine", "Microwave Repair", "Deep Cleaning"];
  const [placeholderText, setPlaceholderText] = useState("");
  const [termIndex, setTermIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let typingSpeed = isDeleting ? 40 : 120;
    
    if (!isDeleting && placeholderText === searchTerms[termIndex]) {
      // Pause at the end of typing
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && placeholderText === "") {
      // Pause before starting the next word
      setIsDeleting(false);
      setTermIndex((prev) => (prev + 1) % searchTerms.length);
      const timeout = setTimeout(() => {}, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setPlaceholderText((prev) => {
        const fullTerm = searchTerms[termIndex];
        if (isDeleting) {
          return fullTerm.substring(0, prev.length - 1);
        } else {
          return fullTerm.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, termIndex]);

  // Debounce search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setResults(data.results || []);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery("");
    
    // If it's a category, go to category page.
    // If it's a service, go to its category page (since services are shown on the category page)
    const targetUrl = item.type === 'category' 
      ? `/category/${item.id}` 
      : `/category/${item.category_id}`;
      
    router.push(targetUrl);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        className="block w-full pl-10 pr-4 py-2.5 rounded-lg leading-5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white focus:border-purple-600 sm:text-sm transition-colors relative z-0"
        placeholder={`Search for "${placeholderText}"`}
      />

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden top-full">
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((item, index) => (
                <div 
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                    {item.image_url && item.image_url.length > 5 ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span>{item.type === 'category' ? '📂' : '🔧'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{item.type}</p>
                  </div>
                  {item.selling_price && (
                    <div className="text-sm font-bold text-blue-600 shrink-0">
                      ₹{Number(item.selling_price)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
