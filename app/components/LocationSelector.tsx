"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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

export default function LocationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  
  // Location States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved location on mount, or auto-detect
  useEffect(() => {
    const syncUrl = (city: string) => {
      if (pathname === '/' && city) {
        // Update URL to match city without reloading
        window.history.replaceState(null, '', `/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
      }
    };

    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        if (parsed.city) syncUrl(parsed.city);
      } catch (e) {
        console.error("Failed to parse saved location");
      }
    } else {
      // Silently try to get location if not set
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch("/api/location/geocode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude }),
              });
              const data = await response.json();
              if (response.ok && data.success) {
                setLocation(data.data);
                localStorage.setItem("user_location", JSON.stringify(data.data));
                if (data.data.city) syncUrl(data.data.city);
              }
            } catch (err) {
              console.warn("Auto-detect location failed", err);
            }
          },
          (err) => { console.warn("Auto-detect permission denied or failed", err); },
          { timeout: 5000 }
        );
      }
    }
  }, [pathname]);

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
        if (response.ok && data.success) {
          setSearchResults(data.data);
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

  const handleSelectLocation = (locationData: LocationData) => {
    setLocation(locationData);
    localStorage.setItem("user_location", JSON.stringify(locationData));
    window.dispatchEvent(new Event("location_changed"));
    
    if (locationData.city) {
      router.push(`/${locationData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
    
    setIsOpen(false);
  };

  const handleGetCurrentLocation = () => {
    setError(null);
    setIsLoading(true);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call our secure backend API to reverse geocode
          const response = await fetch("/api/location/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            let errorMsg = data.error || "Failed to resolve location";
            if (errorMsg.includes("API Key is not configured")) {
              errorMsg = "Location service configuration error (API Key is missing). Please verify .env settings.";
            } else if (errorMsg.includes("REQUEST_DENIED")) {
              errorMsg = "Google Geocoding API request denied. Please ensure Billing is enabled on your Google Cloud Project.";
            } else if (errorMsg.includes("Unable to resolve location")) {
              errorMsg = "Address not found. Please type your location manually.";
            }
            throw new Error(errorMsg);
          }

          const locationData = data.data;
          
          // Save to state and local storage
          setLocation(locationData);
          localStorage.setItem("user_location", JSON.stringify(locationData));
          window.dispatchEvent(new Event("location_changed"));
          
          if (locationData.city) {
            router.push(`/${locationData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
          }
          
          // Close modal after successful detection
          setIsOpen(false);
        } catch (err: any) {
          setError(err.message || "Failed to detect location");
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Location permission was denied. Please allow access in your browser settings.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("Location information is currently unavailable.");
            break;
          case geoError.TIMEOUT:
            setError("The request to get your location timed out.");
            break;
          default:
            setError("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Determine what to show on the trigger button
  const getButtonText = () => {
    if (location && (location.address || (location as any).fullAddress)) {
      return location.address || (location as any).fullAddress;
    }
    if (location && location.city) {
      return location.city;
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
          <MapPin className="text-rose-500 w-4 h-4 shrink-0" />
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
