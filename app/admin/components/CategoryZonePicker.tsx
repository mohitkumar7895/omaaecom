"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, X, Search, History, Trash2, CheckCircle2 } from "lucide-react";

interface CategoryZonePickerProps {
  initialZonesLocation?: string;
  onChange?: (zonesStr: string, zonesCount: number) => void;
}

const COMMON_PRESETS = [
  "Noida",
  "Greater Noida",
  "Delhi",
  "New Delhi",
  "Ghaziabad",
  "Gurgaon",
  "Faridabad",
  "Agra",
  "Mathura",
  "Bharthana",
  "Etawah",
  "Kanpur",
  "Lucknow",
  "Meerut"
];

export default function CategoryZonePicker({
  initialZonesLocation = "Noida, Delhi",
  onChange
}: CategoryZonePickerProps) {
  // Parse initial tags
  const initialTags = initialZonesLocation
    ? initialZonesLocation
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : ["Noida", "Delhi"];

  const [zones, setZones] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const [selectedMapLocation, setSelectedMapLocation] = useState(
    initialTags[0] || "Noida"
  );
  
  // History state persisted in localStorage
  const [zoneHistory, setZoneHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("omaa_admin_zone_history");
      if (saved) {
        setZoneHistory(JSON.parse(saved));
      } else {
        const defaults = ["Noida", "Delhi", "Greater Noida", "Ghaziabad", "Bharthana", "Agra"];
        setZoneHistory(defaults);
        localStorage.setItem("omaa_admin_zone_history", JSON.stringify(defaults));
      }
    } catch (e) {
      console.warn("Could not load zone history", e);
    }
  }, []);

  const saveHistory = (locationName: string) => {
    const trimmed = locationName.trim();
    if (!trimmed) return;
    try {
      setZoneHistory((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 20); // Keep last 20
        localStorage.setItem("omaa_admin_zone_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {}
  };

  const clearHistory = () => {
    setZoneHistory([]);
    try {
      localStorage.removeItem("omaa_admin_zone_history");
    } catch (e) {}
  };

  const updateParent = (newZones: string[]) => {
    setZones(newZones);
    const zonesStr = newZones.join(", ");
    if (onChange) {
      onChange(zonesStr, newZones.length || 1);
    }
  };

  const handleAddZone = (zoneName: string) => {
    const trimmed = zoneName.trim();
    if (!trimmed) return;
    
    // Save to history
    saveHistory(trimmed);

    // Check if already exists in active list (case-insensitive)
    if (zones.some((z) => z.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      setSelectedMapLocation(trimmed);
      return;
    }

    const updated = [...zones, trimmed];
    updateParent(updated);
    setSelectedMapLocation(trimmed);
    setInputValue("");
  };

  const handleRemoveZone = (indexToRemove: number) => {
    const updated = zones.filter((_, idx) => idx !== indexToRemove);
    updateParent(updated);
    if (updated.length > 0) {
      setSelectedMapLocation(updated[updated.length - 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddZone(inputValue);
    }
  };

  const handleSearchClick = () => {
    if (inputValue.trim()) {
      handleAddZone(inputValue);
    } else if (zones.length > 0) {
      setSelectedMapLocation(zones[0]);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Hidden inputs for standard Form submission */}
      <input type="hidden" name="zones_location" value={zones.join(", ")} />
      <input type="hidden" name="zones" value={zones.length || 1} />

      {/* Input row */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            Add Zones & Multiple Service Locations
          </label>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {zones.length} {zones.length === 1 ? "Zone" : "Zones"} Selected
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type area/city name and press Enter (e.g. Noida, Greater Noida, Delhi, Bharthana)"
              className="w-full border border-gray-200 rounded-lg text-sm px-4 py-2.5 outline-none focus:border-indigo-500 bg-white pr-10 shadow-xs"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearchClick}
            className="bg-[#2c3e50] hover:bg-[#1a252f] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>
        </div>
      </div>

      {/* Active Selected Zones Tags */}
      <div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Active Marked Zones for this Category:
        </span>
        
        {zones.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {zones.map((zone, index) => {
              const isSelectedOnMap = selectedMapLocation.toLowerCase() === zone.toLowerCase();
              return (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all border ${
                    isSelectedOnMap
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300"
                      : "bg-white text-gray-800 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMapLocation(zone)}
                    className="flex items-center gap-1 cursor-pointer"
                    title="Click to view on map"
                  >
                    <MapPin className={`w-3 h-3 ${isSelectedOnMap ? "text-white" : "text-rose-500"}`} />
                    <span>{zone}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(index)}
                    className={`hover:bg-black/10 rounded-full p-0.5 transition ${
                      isSelectedOnMap ? "text-white hover:text-gray-200" : "text-gray-400 hover:text-red-500"
                    }`}
                    title="Remove Zone"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No zones added yet. Please add at least one location.</p>
        )}
      </div>

      {/* Quick Add Presets */}
      <div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
          Popular Suggested Locations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PRESETS.map((preset) => {
            const isAdded = zones.some((z) => z.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                disabled={isAdded}
                onClick={() => handleAddZone(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  isAdded
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200"
                }`}
              >
                + {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Google Map View dynamically displaying the selected/entered zone */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Map Area: <span className="text-indigo-600">{selectedMapLocation || "Delhi NCR"}</span>
          </span>
          <span className="text-[11px] text-gray-400 font-normal">
            (Interactive Google Map with live place markers)
          </span>
        </div>

        <div className="w-full h-80 sm:h-96 border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-100 relative">
          <iframe
            key={selectedMapLocation}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              selectedMapLocation ? `${selectedMapLocation}, India` : "Noida, Delhi, India"
            )}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            className="filter invert-[90%] hue-rotate-[180deg] contrast-[90%] brightness-[95%] grayscale-[10%]"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            title="Google Map Zone View"
          ></iframe>
        </div>
      </div>

      {/* Map ke Neeche Zone History Section */}
      <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Recently Added Zones History ({zoneHistory.length})
            </h4>
          </div>

          {zoneHistory.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" />
              Clear History
            </button>
          )}
        </div>

        <p className="text-[11px] text-gray-500">
          Aapne pehle jo bhi zones add kiye the wo yahan list hain. 1-Click mein dobara map par add ya view karein:
        </p>

        {zoneHistory.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {zoneHistory.map((item, idx) => {
              const isAlreadyAdded = zones.some((z) => z.toLowerCase() === item.toLowerCase());
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 shadow-xs hover:border-indigo-300 transition"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMapLocation(item)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-indigo-600 truncate flex-1 text-left"
                    title="View on Map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddZone(item)}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold transition ml-1 shrink-0 ${
                      isAlreadyAdded
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                    title={isAlreadyAdded ? "Already Active" : "Add to this Category"}
                  >
                    {isAlreadyAdded ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No zone history yet. As you add zones, they will appear here.</p>
        )}
      </div>

    </div>
  );
}
