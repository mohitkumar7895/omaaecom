"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentLocation } from "@/lib/location";
import { getKeywordPage } from "@/lib/seo-keywords";
import { locationToCitySlug, matchSeoLocationSlug } from "@/lib/seo-locations";
import { getGaurCitySociety } from "@/lib/gaur-city-data";
import {
  getConfirmedLocation,
  setConfirmedLocation,
  ConfirmedLocation,
} from "@/lib/location-state";
import {
  ChevronDown,
  MapPin,
  LocateFixed,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Building,
  Compass,
  X
} from "lucide-react";

interface LocationData {
  latitude?: number;
  longitude?: number;
  address: string;
  shortAddress?: string;
  fullAddress?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  mohalla?: string;
  sector?: string;
  houseNumber?: string;
  street?: string;
  placeId?: string;
  mainText?: string;
  secondaryText?: string;
}

const POPULAR_HUBS = [
  { name: "Gaur City 2", locality: "Gaur City 2, Greater Noida West", city: "Greater Noida West", lat: 28.609, lng: 77.432 },
  { name: "Gaur City 1", locality: "Gaur City 1, Greater Noida West", city: "Greater Noida West", lat: 28.613, lng: 77.428 },
  { name: "Indirapuram", locality: "Indirapuram, Ghaziabad", city: "Ghaziabad", lat: 28.641, lng: 77.371 },
  { name: "Noida Extension", locality: "Noida Extension, Greater Noida West", city: "Greater Noida West", lat: 28.605, lng: 77.438 },
  { name: "Sector 62, Noida", locality: "Sector 62, Noida", city: "Noida", lat: 28.620, lng: 77.363 },
  { name: "Pari Chowk", locality: "Pari Chowk, Greater Noida", city: "Greater Noida", lat: 28.468, lng: 77.503 },
  { name: "Gurugram", locality: "Gurugram, Haryana", city: "Gurugram", lat: 28.459, lng: 77.026 },
  { name: "Delhi NCR", locality: "Delhi NCR", city: "Delhi", lat: 28.613, lng: 77.209 },
];

const NON_CITY_ROUTES = new Set([
  'about', 'admin', 'api', 'cart', 'cashback', 'checkout', 'complaint',
  'contact', 'invoice', 'login', 'manage-address', 'my-amc', 'my-bookings',
  'privacy', 'privacy-policy', 'product-history', 'professional-registration',
  'rate-card', 'refer-earn', 'service-areas', 'services', 'settings',
  'sitemap', 'sitemap.xml', 'sitemap-directory', 'sitemap-pages', 'robots.txt', 'sso-callback', 'terms',
  'terms-and-conditions', 'wallet', 'member_login', 'registration_form.php',
  'gaur-city-2'
]);

function shouldSyncCityUrl(pathname: string) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/gaur-city-2")) return false;
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
  const [isVerifyingZone, setIsVerifyingZone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedLocation, setConfirmedState] = useState<ConfirmedLocation | null>(null);

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

  const newSessionToken = () => {
    sessionTokenRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  };

  // 1. Initial Load & Persistence: Check if location is confirmed
  useEffect(() => {
    const existing = getConfirmedLocation();
    if (existing && existing.isConfirmed) {
      setConfirmedState(existing);
    } else {
      // Rule 1: First visit without confirmed location -> Automatically open location modal
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }

    const handleLocationChange = () => {
      const fresh = getConfirmedLocation();
      setConfirmedState(fresh);
    };

    const handleOpenModal = () => {
      setIsOpen(true);
    };

    window.addEventListener("location_confirmed", handleLocationChange);
    window.addEventListener("location_changed", handleLocationChange);
    window.addEventListener("storage", handleLocationChange);
    window.addEventListener("open_location_modal", handleOpenModal);

    return () => {
      window.removeEventListener("location_confirmed", handleLocationChange);
      window.removeEventListener("location_changed", handleLocationChange);
      window.removeEventListener("storage", handleLocationChange);
      window.removeEventListener("open_location_modal", handleOpenModal);
    };
  }, []);

  // Modal Animation and Focus
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setError(null);
      newSessionToken();
      const timer = setTimeout(() => {
        setVisible(true);
        searchInputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        setError(null);
        setSearchQuery("");
        setSearchResults([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced Place Autocomplete Search
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
    }, 350);

    return () => {
      clearTimeout(timer);
      searchAbortRef.current?.abort();
    };
  }, [searchQuery]);

  // Core Zone Verification & Confirmation Function
  const confirmAndApplyLocation = async (rawLoc: {
    address: string;
    shortAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  }) => {
    setIsVerifyingZone(true);
    setError(null);

    try {
      const cleanCity = rawLoc.city || (rawLoc.address.includes("Noida") ? "Noida" : "Delhi NCR");
      const shortAddr = rawLoc.shortAddress || rawLoc.address.split(",")[0].trim() || cleanCity;

      let zoneId: number | null = null;
      let zoneName: string = "Doorstep Service Zone";
      let allowedCategoryIds: number[] = [];

      try {
        const res = await fetch("/api/zones/for-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: rawLoc.lat,
            lng: rawLoc.lng,
            city: rawLoc.city || "",
            address: rawLoc.address || "",
          }),
        });

        const zoneInfo = await res.json();
        if (zoneInfo) {
          if (zoneInfo.zoneId) zoneId = zoneInfo.zoneId;
          if (zoneInfo.zoneName) zoneName = zoneInfo.zoneName;
          if (Array.isArray(zoneInfo.allowedCategoryIds)) {
            allowedCategoryIds = zoneInfo.allowedCategoryIds;
          }
        }
      } catch (e) {
        // Fallback gracefully
      }

      const confirmed = setConfirmedLocation({
        isConfirmed: true,
        address: rawLoc.address,
        shortAddress: shortAddr,
        city: cleanCity,
        state: rawLoc.state || "",
        postalCode: rawLoc.postalCode || "",
        latitude: rawLoc.lat,
        longitude: rawLoc.lng,
        zoneId: zoneId,
        zoneName: zoneName,
        isServiceable: allowedCategoryIds.length > 0,
        allowedCategoryIds: allowedCategoryIds,
      });

      setConfirmedState(confirmed);
      setIsOpen(false);

      // Route synchronization if city URL
      if (pathname && shouldSyncCityUrl(pathname)) {
        const slug = routeSlugForLocation({
          address: rawLoc.address,
          city: cleanCity,
          shortAddress: shortAddr,
        });
        if (slug && pathname !== `/${slug}`) {
          router.replace(`/${slug}`);
        }
      }
    } catch (err: any) {
      console.error("Zone confirmation error:", err);
      const cleanCity = rawLoc.city || "Delhi NCR";
      const shortAddr = rawLoc.shortAddress || rawLoc.address.split(",")[0].trim() || cleanCity;
      const confirmed = setConfirmedLocation({
        isConfirmed: true,
        address: rawLoc.address,
        shortAddress: shortAddr,
        city: cleanCity,
        state: rawLoc.state || "",
        postalCode: rawLoc.postalCode || "",
        latitude: rawLoc.lat,
        longitude: rawLoc.lng,
        zoneId: null,
        zoneName: "Doorstep Service Zone",
        isServiceable: false,
        allowedCategoryIds: [],
      });
      setConfirmedState(confirmed);
      setIsOpen(false);
    } finally {
      setIsVerifyingZone(false);
    }
  };

  // Handler for GPS Current Location
  const handleGetCurrentLocation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const locationData = await getCurrentLocation();
      await confirmAndApplyLocation({
        address: locationData.fullAddress || locationData.address,
        shortAddress: locationData.shortAddress || locationData.city,
        city: locationData.city,
        state: locationData.state,
        postalCode: locationData.postalCode,
        lat: locationData.latitude,
        lng: locationData.longitude,
      });
    } catch (err: any) {
      setError(err.message || "Failed to detect current location. Please search manually or select an area.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Searching & selecting a place
  const handleSelectSearchResult = async (item: LocationData) => {
    if (!item.placeId) {
      await confirmAndApplyLocation({
        address: item.address,
        shortAddress: item.shortAddress || item.mainText,
        city: item.city,
        lat: item.latitude,
        lng: item.longitude,
      });
      return;
    }

    setError(null);
    setResolvingPlaceId(item.placeId);
    try {
      const params = new URLSearchParams({
        placeId: item.placeId,
        session: sessionTokenRef.current,
      });
      const response = await fetch(`/api/location/search?${params.toString()}`);
      const data = await response.json();
      const details = data.data;
      if (!response.ok || !details) {
        throw new Error("Could not load address details.");
      }
      await confirmAndApplyLocation({
        address: details.fullAddress || details.address || item.address,
        shortAddress: details.shortAddress || item.shortAddress || item.mainText,
        city: details.city || item.city,
        state: details.state,
        postalCode: details.postalCode,
        lat: details.latitude,
        lng: details.longitude,
      });
      newSessionToken();
    } catch (err: any) {
      setError(err.message || "Could not resolve address details. Please pick a location from the list.");
    } finally {
      setResolvingPlaceId(null);
    }
  };

  // Handler for Quick Hub Chips
  const handleSelectQuickHub = async (hub: typeof POPULAR_HUBS[0]) => {
    await confirmAndApplyLocation({
      address: hub.locality,
      shortAddress: hub.name,
      city: hub.city,
      lat: hub.lat,
      lng: hub.lng,
    });
  };

  // Trigger Button Display Text
  const getButtonText = () => {
    if (confirmedLocation?.isConfirmed) {
      const short = confirmedLocation.shortAddress || confirmedLocation.city;
      if (short) return short;
      if (confirmedLocation.address) return confirmedLocation.address.split(",")[0];
    }

    if (pathname && pathname.startsWith("/gaur-city-2")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const soc = getGaurCitySociety(parts[1]);
        if (soc) return `${soc.name}, Gaur City 2`;
      }
      return "Gaur City 2";
    }

    return "Select Location";
  };

  const isConfirmed = Boolean(confirmedLocation?.isConfirmed);

  return (
    <>
      {/* Navbar Trigger Button */}
      <div
        onClick={() => setIsOpen(true)}
        id="navbar-location-selector"
        className={`flex items-center justify-between border px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl cursor-pointer transition mr-1 sm:mr-2 min-w-[130px] sm:min-w-[170px] max-w-[220px] sm:max-w-[340px] shadow-xs group ${isConfirmed
            ? "bg-white hover:bg-slate-50 border-slate-200"
            : "bg-amber-50 hover:bg-amber-100/80 border-amber-300 ring-2 ring-amber-400/30 animate-pulse"
          }`}
        title={confirmedLocation?.address || "Click to select service location"}
      >
        <div className="flex items-center space-x-2 overflow-hidden min-w-0">
          <MapPin className={`w-4 h-4 shrink-0 ${isConfirmed ? "text-indigo-600" : "text-amber-600"}`} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
              {isConfirmed ? "Location" : "Select Location"}
            </span>
            <span className="text-xs sm:text-sm text-slate-800 font-semibold truncate leading-tight mt-0.5">
              {getButtonText()}
            </span>
          </div>
        </div>
        <ChevronDown className="text-slate-400 group-hover:text-slate-600 w-4 h-4 shrink-0 ml-1.5 transition-transform" />
      </div>

      {/* Modal Overlay & Dialog */}
      {mounted && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">

          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => {
              // If location is already confirmed, allow closing. If not confirmed, prompt user.
              if (!isVerifyingZone && !isLoading) {
                setIsOpen(false);
              }
            }}
          />

          {/* Modal Container */}
          <div
            className={`relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 will-change-transform z-10 my-auto ${visible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
              }`}
          >
            {/* Header with Title and Trust Badge */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-indigo-50/50 to-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Doorstep Appliance Repair in 60-90 Mins</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Select Your Service Location
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Doorstep service availability, rates, and technician slots are customized to your society & sector.
                  </p>
                </div>

                {/* Close Button (only if already confirmed) */}
                {isConfirmed && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* GPS Current Location Button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLoading || isVerifyingZone}
                className="mt-4 w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading || isVerifyingZone ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                <span>{isLoading ? "Detecting GPS Location..." : isVerifyingZone ? "Checking Service Zone..." : "Use Current Location (GPS)"}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 pt-4 max-h-[65vh] overflow-y-auto space-y-4">

              {/* Error Message */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start space-x-2 text-xs sm:text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Search Bar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Or Search Locality / Society / Sector
                </label>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xs">
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="E.g. Gaur City 2, Ahinsa Khand Indirapuram, Sector 62..."
                    disabled={isLoading || isVerifyingZone || Boolean(resolvingPlaceId)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 font-medium text-xs sm:text-sm min-w-0"
                  />
                  {isSearching && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin ml-2 shrink-0" />}
                </div>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm max-h-[200px] overflow-y-auto">
                  {searchResults.map((res, idx) => (
                    <button
                      key={res.placeId || idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      disabled={Boolean(resolvingPlaceId) || isVerifyingZone}
                      className="w-full text-left p-3 hover:bg-indigo-50/60 flex items-start space-x-2.5 transition-colors disabled:opacity-60 text-xs sm:text-sm cursor-pointer"
                    >
                      {resolvingPlaceId && res.placeId === resolvingPlaceId ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate">
                          {res.mainText || res.shortAddress || res.address}
                        </p>
                        {(res.secondaryText || res.city) && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {res.secondaryText || res.city}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Service Hubs (One-click selection) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Popular OMAA Service Hubs (Instant Confirm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_HUBS.map((hub, idx) => {
                    const isSelected =
                      confirmedLocation?.shortAddress === hub.name ||
                      confirmedLocation?.city === hub.city;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuickHub(hub)}
                        disabled={isVerifyingZone}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer active:scale-95 ${isSelected
                            ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs ring-1 ring-indigo-300"
                            : "bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-700 hover:border-indigo-200"
                          }`}
                      >
                        <div className="truncate pr-1">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{hub.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {hub.city}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Verified Doorstep Service Across Delhi NCR</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">OMAA Smart Location v2</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
