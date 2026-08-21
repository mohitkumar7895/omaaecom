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

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Failed to parse saved location");
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
        className="flex items-center space-x-1.5 bg-gray-100/80 px-4 py-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition mr-2 max-w-[150px] sm:max-w-[200px]"
      >
        <MapPin className="text-[#5c67b8] w-4 h-4 shrink-0" />
        <span className="text-[13px] font-semibold text-gray-700 truncate">{getButtonText()}</span>
        <ChevronDown className="text-[#5c67b8] w-4 h-4 shrink-0" />
      </div>

      {/* Modal Overlay */}
      {mounted && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
          
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isLoading && setIsOpen(false)}
          />
          
          {/* Modal Card */}
          <div 
            className={`relative w-full sm:w-[500px] bg-white rounded-t-[32px] sm:rounded-[24px] shadow-2xl p-6 md:p-8 transform transition-transform duration-300 border border-gray-100 will-change-transform ${
              visible ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ transitionTimingFunction: "ease-out" }}
          >
            
            {/* Close Button */}
            <button 
              onClick={() => !isLoading && setIsOpen(false)}
              disabled={isLoading}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>

            <div className="mt-2 space-y-6">
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight text-center sm:text-left mb-6">
                Select your location
              </h2>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start space-x-2 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Use Current Location Button */}
              <button 
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full bg-[#f8f6fb] hover:bg-[#f0ebf9] transition rounded-[20px] p-4 flex items-center justify-between group disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-[#6b62d9] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 text-white stroke-[2] animate-spin" />
                    ) : (
                      <LocateFixed className="w-6 h-6 text-white stroke-[2]" />
                    )}
                  </div>
                  <span className="font-bold text-gray-800 text-[17px] text-left">
                    {isLoading ? "Detecting location..." : "Use current location"}
                  </span>
                </div>
                {!isLoading && (
                  <ChevronRight className="w-5 h-5 text-[#8878e1] group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 my-2">
                <div className="h-px w-full bg-gray-100"></div>
                <span className="text-xs text-gray-400 font-medium uppercase px-2">OR</span>
                <div className="h-px w-full bg-gray-100"></div>
              </div>

              {/* Search Bar */}
              <div className={`relative flex items-center border border-gray-200 rounded-[20px] bg-white p-2 shadow-sm focus-within:border-[#8878e1] focus-within:ring-2 focus-within:ring-[#8878e1]/20 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="pl-3 pr-2 flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  placeholder="Search area, street or city..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-base min-w-0"
                />
                <button 
                  disabled={isLoading}
                  className="bg-[#6b62d9] hover:bg-[#5b52c9] transition text-white font-bold py-3 px-6 sm:px-8 rounded-2xl ml-2 shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
