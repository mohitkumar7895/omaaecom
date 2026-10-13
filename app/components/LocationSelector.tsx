"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentLocation, autoDetectLocation } from "@/lib/location";
import { getKeywordPage } from "@/lib/seo-keywords";
import { locationToCitySlug, matchSeoLocationSlug } from "@/lib/seo-locations";
import { ChevronDown, MapPin, X, LocateFixed, Search, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface LocationData {
  latitude?: number;
  longitude?: number;
  address: string;
  shortAddress?: string;
  fullAddress?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mohalla?: string;
  sector?: string;
  houseNumber?: string;
  street?: string;
  placeId?: string;
  mainText?: string;
  secondaryText?: string;
}

const NON_CITY_ROUTES = new Set([
  'about', 'admin', 'api', 'cart', 'cashback', 'checkout', 'complaint', 
  'contact', 'invoice', 'login', 'manage-address', 'my-amc', 'my-bookings', 
  'privacy', 'privacy-policy', 'product-history', 'professional-registration', 
  'rate-card', 'refer-earn', 'service-areas', 'services', 'settings', 
  'sitemap', 'sitemap.xml', 'sitemap-directory', 'sitemap-pages', 'robots.txt', 'sso-callback', 'terms', 
  'terms-and-conditions', 'wallet', 'member_login', 'registration_form.php'
]);

function shouldSyncCityUrl(pathname: string) {
  if (pathname === "/") return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return false;
  const first = parts[0].toLowerCase();
  if (NON_CITY_ROUTES.has(first)) return false;
  if (getKeywordPage(first)) return false;
  return true;
}

function routeSlugForLocation(loc: LocationData | null | undefined): string | undefined {
  if (!loc) return undefined;
  const blob = [loc.city, loc.shortAddress, loc.address, loc.mohalla, loc.sector]
    .filter(Boolean)
    .join(" ");
  const seo = matchSeoLocationSlug(loc.city, blob);
  if (seo) return seo;

  const fallback = locationToCitySlug(loc.city || loc.mohalla || "");
  if (!fallback || fallback.length < 3) return undefined;
  if (fallback === "local-area" || fallback === "india") return undefined;
  if (NON_CITY_ROUTES.has(fallback)) return undefined;
  if (getKeywordPage(fallback)) return undefined;
  return fallback;
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
  const [resolvingPlaceId, setResolvingPlaceId] = useState<string | null>(null);
  const sessionTokenRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
  );
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const detectGenerationRef = useRef(0);

  const lockSavedLocation = () => {
    try {
      sessionStorage.setItem("omaa_location_locked", "1");
      localStorage.removeItem("omaa_location_locked");
    } catch {}
  };

  const isLocationLocked = () => {
    try {
      return sessionStorage.getItem("omaa_location_locked") === "1";
    } catch {
      return false;
    }
  };

  const isPageReload = () => {
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") return true;
    } catch {}
    return false;
  };

  const newSessionToken = () => {
    sessionTokenRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  };

  // Refresh → auto GPS. Search select stays until the next refresh.
  useEffect(() => {
    const loadOrDetect = async () => {
      if (isPageReload()) {
        try {
          sessionStorage.removeItem("omaa_location_locked");
          localStorage.removeItem("omaa_location_locked");
        } catch {}
      }

      const savedLocation = localStorage.getItem("user_location");
      let parsedSaved: LocationData | null = null;
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          if (parsed && (parsed.city || parsed.address || parsed.shortAddress)) {
            parsedSaved = parsed;
            setLocation(parsed);
            if (shouldSyncCityUrl(pathname || "/") && !isPageReload()) {
              const slug = routeSlugForLocation(parsed);
              if (slug && pathname !== `/${slug}`) router.replace(`/${slug}`);
            }
          }
        } catch (e) {
          console.error("Failed to parse saved location");
        }
      }

      if (!isPageReload() && isLocationLocked() && parsedSaved) {
        return;
      }

      const generation = ++detectGenerationRef.current;
      setIsAutoDetecting(true);
      try {
        const detected = await autoDetectLocation();
        if (generation !== detectGenerationRef.current || isLocationLocked()) return;
        if (detected && (detected.city || detected.address || detected.latitude)) {
          lockSavedLocation();
          setLocation(detected);
          localStorage.setItem("user_location", JSON.stringify(detected));
          window.dispatchEvent(new Event("location_changed"));
          if (shouldSyncCityUrl(pathname || "/")) {
            const slug = routeSlugForLocation(detected);
            if (slug && pathname !== `/${slug}`) {
              router.replace(`/${slug}`);
            }
          }
        }
      } catch (err) {
        console.warn("Auto detect location failed:", err);
      } finally {
        if (generation === detectGenerationRef.current) setIsAutoDetecting(false);
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
      newSessionToken();
      setTimeout(() => {
        setVisible(true);
        searchInputRef.current?.focus();
      }, 20);
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

  // Debounced Google autocomplete — one request after typing pauses
  useEffect(() => {
    const q = searchQuery.trim();
    searchAbortRef.current?.abort();

    if (q.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      try {
        const params = new URLSearchParams({
          q,
          session: sessionTokenRef.current,
        });
        const response = await fetch(`/api/location/search?${params.toString()}`, {
          signal: ctrl.signal,
        });
        const data = await response.json();
        if (response.ok && (data.success || data.results)) {
          const mapped = (data.results || []).map((r: any) => ({
            placeId: r.placeId,
            address: r.address || r.display_name || r.mainText || "",
            shortAddress: r.mainText || r.shortAddress || r.display_name || "",
            mainText: r.mainText,
            secondaryText: r.secondaryText,
            city: r.secondaryText || r.city || "",
            mohalla: r.mohalla || "",
            sector: r.sector || "",
            state: r.state || "",
            country: r.country || "India",
            postalCode: r.postalCode || "",
          }));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("Search error:", err);
      } finally {
        if (!ctrl.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      searchAbortRef.current?.abort();
    };
  }, [searchQuery]);

  const applyLocation = (locationData: LocationData) => {
    detectGenerationRef.current += 1;
    setIsAutoDetecting(false);
    lockSavedLocation();
    setLocation(locationData);
    localStorage.setItem("user_location", JSON.stringify(locationData));
    window.dispatchEvent(new Event("location_changed"));
    setIsOpen(false);

    if (!pathname || !shouldSyncCityUrl(pathname)) return;
    const slug = routeSlugForLocation(locationData);
    if (!slug) return;
    const nextPath = `/${slug}`;
    if (pathname !== nextPath) {
      router.push(nextPath);
    }
  };

  const handleSelectLocation = async (locationData: LocationData) => {
    if (!locationData.placeId) {
      applyLocation(locationData);
      return;
    }
    setError(null);
    setResolvingPlaceId(locationData.placeId);
    try {
      const params = new URLSearchParams({
        placeId: locationData.placeId,
        session: sessionTokenRef.current,
      });
      const response = await fetch(`/api/location/search?${params.toString()}`);
      const data = await response.json();
      const details = data.data;
      if (!response.ok || !details) {
        throw new Error("Could not load that address. Try another suggestion.");
      }
      applyLocation({
        address: details.shortAddress || details.fullAddress || locationData.address,
        shortAddress: details.shortAddress || locationData.shortAddress,
        fullAddress: details.fullAddress,
        city: details.city || "",
        mohalla: details.mohalla || "",
        sector: details.sector || "",
        state: details.state || "",
        country: details.country || "India",
        postalCode: details.postalCode || "",
        houseNumber: details.houseNumber || "",
        street: details.street || "",
        latitude: details.latitude,
        longitude: details.longitude,
      });
      newSessionToken();
    } catch (err: any) {
      setError(err.message || "Could not load that address.");
    } finally {
      setResolvingPlaceId(null);
    }
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
    if (location) {
      const spoken = [
        location.houseNumber,
        location.street,
        location.sector,
        location.mohalla,
        location.city,
      ]
        .filter((part): part is string => Boolean(part))
        .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
      if (spoken.length >= 2) return spoken.join(", ");
    }
    if (location?.shortAddress) return location.shortAddress;
    if (location?.address) return location.address;
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
        className="flex items-center justify-between bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition mr-2 min-w-[180px] max-w-[280px] sm:max-w-[440px] shadow-sm"
        title={(location as any)?.fullAddress || getButtonText()}
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          {isAutoDetecting ? (
            <Loader2 className="text-[#6b62d9] w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <MapPin className="text-rose-500 w-4 h-4 shrink-0" />
          )}
          <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium line-clamp-2 break-words leading-tight">{getButtonText()}</span>
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for your location/society/apartment"
                  disabled={isLoading || Boolean(resolvingPlaceId)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
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
                      key={res.placeId || idx}
                      onClick={() => handleSelectLocation(res)}
                      disabled={Boolean(resolvingPlaceId)}
                      className="w-full text-left p-4 hover:bg-gray-50 flex items-start space-x-3 transition-colors disabled:opacity-60"
                    >
                      {resolvingPlaceId && res.placeId === resolvingPlaceId ? (
                        <Loader2 className="w-5 h-5 text-[#6b62d9] shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {res.mainText || res.shortAddress || res.address}
                        </p>
                        {(res.secondaryText || res.city) && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {res.secondaryText || res.city}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 3 && !isSearching ? (
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
