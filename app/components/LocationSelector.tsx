"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MapPin, X, LocateFixed, Search, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export default function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  
  // Location States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Load saved location on mount, or auto-detect
  useEffect(() => {
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
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
              }
            } catch (err) {
              console.error("Auto-detect location failed", err);
            }
          },
          (err) => { console.error("Auto-detect permission denied or failed", err); },
          { timeout: 5000 }
        );
      }
    }
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
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
            throw new Error(data.error || "Failed to resolve location");
          }

          const locationData = data.data;
          
          // Save to state and local storage
          setLocation(locationData);
          localStorage.setItem("user_location", JSON.stringify(locationData));
          
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
    if (location && location.city) {
      return location.city;
    }
    if (location && location.address) {
      // Return a short version of the address if no city
      return location.address.split(',')[0];
    }
    return "Select Location";
  };

  return (
    <>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-white border border-gray-200 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition mr-2 min-w-[140px] max-w-[200px] shadow-sm"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <MapPin className="text-gray-500 w-4 h-4 shrink-0" />
          <span className="text-[14px] text-gray-700 truncate">{getButtonText()}</span>
        </div>
        <ChevronDown className="text-gray-400 w-4 h-4 shrink-0 ml-2" />
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
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base min-w-0"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start space-x-2 text-sm font-medium mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
