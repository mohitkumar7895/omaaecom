"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentLocation, autoDetectLocation } from "@/lib/location";
import { getKeywordPage } from "@/lib/seo-keywords";
import { isIndexableLocation, matchSeoLocationSlug } from "@/lib/seo-locations";
import { ChevronDown, MapPin, X, LocateFixed, Search, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface LocationData {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

function shouldSyncCityUrl(pathname: string) {
  if (pathname === "/") return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return false;
  const first = parts[0];
  if (getKeywordPage(first)) return false;
  return isIndexableLocation(first);
}

export default function LocationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  
  // Location States
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved location on mount, or auto-detect immediately
  useEffect(() => {
    const loadOrDetect = async () => {
      const savedLocation = localStorage.getItem("user_location");
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          if (parsed && (parsed.city || parsed.address)) {
            setLocation(parsed);
            if (pathname === "/") {
              const slug = matchSeoLocationSlug(parsed.city, parsed.address);
              if (slug) router.replace(`/${slug}`);
            }
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved location");
        }
      }

      // Auto-detect immediately on website open
      setIsAutoDetecting(true);
      try {
        const detected = await autoDetectLocation();
        if (detected) {
          setLocation(detected);
          localStorage.setItem("user_location", JSON.stringify(detected));
          window.dispatchEvent(new Event("location_changed"));
          if (pathname === "/") {
            const slug = matchSeoLocationSlug(detected.city, detected.address);
            if (slug) router.replace(`/${slug}`);
          }
        }
      } catch (err) {
        console.warn("Auto detect location failed:", err);
      } finally {
        setIsAutoDetecting(false);
      }
    };

    loadOrDetect();

    // Listen to location changes across windows/components
    const handleLocationChange = () => {
      try {
        const saved = localStorage.getItem("user_location");
        if (saved) {
          const parsed = JSON.parse(saved);
          setLocation(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener("location_changed", handleLocationChange);
    window.addEventListener("storage", handleLocationChange);

    return () => {
      window.removeEventListener("location_changed", handleLocationChange);
      window.removeEventListener("storage", handleLocationChange);
    };
  }, []);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => setVisible(true), 20);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        setError(null); // Reset error when closed
        setSearchQuery("");
        setSearchResults([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Search Input with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (response.ok && (data.success || data.results)) {
          // Map Nominatim results to LocationData format
          const mapped = (data.results || data.data || []).map((r: any) => ({
            address: r.display_name || r.address || '',
            city: r.address?.city || r.address?.town || r.address?.village || r.display_name?.split(',')[0] || '',
            state: r.address?.state || '',
            country: r.address?.country || '',
            postalCode: r.address?.postcode || '',
            latitude: r.lat ? Number(r.lat) : undefined,
            longitude: r.lon ? Number(r.lon) : undefined,
          }));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const applyLocation = (locationData: LocationData) => {
    setLocation(locationData);
    localStorage.setItem("user_location", JSON.stringify(locationData));
    window.dispatchEvent(new Event("location_changed"));
    setIsOpen(false);

    if (!pathname || !shouldSyncCityUrl(pathname)) return;
    const slug = matchSeoLocationSlug(locationData.city, locationData.address);
    if (!slug) return;
    const nextPath = `/${slug}`;
    if (pathname !== nextPath) {
      router.push(nextPath);
    }
  };

  const handleSelectLocation = (locationData: LocationData) => {
    applyLocation(locationData);
  };

  const handleGetCurrentLocation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const locationData = await getCurrentLocation();
      
      // Save to state and local storage
      applyLocation(locationData);
    } catch (err: any) {
      setError(err.message || "Failed to detect location");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine what to show on the trigger button
  const getButtonText = () => {
    if (location && (location.address || (location as any).fullAddress)) {
      return location.address || (location as any).fullAddress;
    }
    if (location && location.city) {
      return location.city;
    }
    if (isAutoDetecting) {
      return "Detecting location...";
    }
    return "Select Location";
  };

  return (
    <>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition mr-2 min-w-[150px] max-w-[240px] sm:max-w-[320px] shadow-sm"
        title={getButtonText()}
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          {isAutoDetecting ? (
            <Loader2 className="text-[#6b62d9] w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <MapPin className="text-rose-500 w-4 h-4 shrink-0" />
          )}
          <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium line-clamp-1 break-words">{getButtonText()}</span>
        </div>
        <ChevronDown className="text-gray-400 w-4 h-4 shrink-0 ml-1.5" />
      </div>

      {/* Modal Overlay */}
      {mounted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isLoading && setIsOpen(false)}
          />
          
          {/* Modal Card */}
          <div 
            className={`relative w-full sm:w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden transform transition-transform duration-300 will-change-transform ${
              visible ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ transitionTimingFunction: "ease-out" }}
          >
            <div className="p-4 sm:p-6 pb-2">
              {/* Search Bar matching UC design */}
              <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 sm:p-3 mb-6 focus-within:border-black">
                <button 
                  onClick={() => !isLoading && setIsOpen(false)}
                  className="mr-3 text-gray-700 hover:bg-gray-100 p-1 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <input
                  type="text"
                  placeholder="Search for your location/society/apartment"
                  disabled={isLoading}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-500 font-medium text-sm sm:text-base min-w-0"
                />
                {isSearching && <Loader2 className="w-5 h-5 text-gray-400 animate-spin ml-2" />}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start space-x-2 text-sm font-medium mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto mb-4 border border-gray-100 rounded-xl divide-y divide-gray-100 shadow-sm">
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLocation(res)}
                      className="w-full text-left p-4 hover:bg-gray-50 flex items-start space-x-3 transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{res.address.split(',')[0]}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{res.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() && !isSearching ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No locations found for "{searchQuery}"
                </div>
              ) : null}

              {/* Use Current Location Button */}
              <button 
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 group disabled:opacity-70 disabled:cursor-not-allowed py-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-[#6b62d9] animate-spin" />
                ) : (
                  <LocateFixed className="w-5 h-5 text-[#6b62d9]" />
                )}
                <span className="font-semibold text-[#6b62d9] text-base">
                  {isLoading ? "Detecting location..." : "Use current location"}
                </span>
              </button>
            </div>

            {/* Divider and Google text */}
            <div className="w-full h-3 bg-gray-100 mt-4"></div>
            <div className="py-4 flex justify-center items-center">
              <span className="text-gray-500 text-xs font-medium mr-1">powered by</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-4 opacity-70 grayscale" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
