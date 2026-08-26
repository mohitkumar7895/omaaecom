"use client";

import { useState } from "react";
import { ZoneData, saveZone, deleteZone } from "../../../app/actions/zones";
import { MapPin, Plus, Trash2, Edit, Save, CheckCircle2, AlertCircle, Layers, Globe, Check, Eye } from "lucide-react";
import Link from "next/link";

interface CategoryOption {
  id: number;
  title: string;
  image_url?: string;
  type?: string;
}

export default function ZoneManager({
  initialZones,
  categories,
}: {
  initialZones: ZoneData[];
  categories: CategoryOption[];
}) {
  const [zones, setZones] = useState<ZoneData[]>(initialZones);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [currentZone, setCurrentZone] = useState<ZoneData>({
    name: "",
    city_names: "",
    coordinates: {
      type: "circle",
      center: { lat: 28.5355, lng: 77.391 }, // Default Noida
      radiusKm: 25,
      points: [],
    },
    category_ids: categories.map((c) => c.id),
    status: "Active",
  });

  const handleStartCreate = () => {
    setCurrentZone({
      name: `Zone ${zones.length + 1}`,
      city_names: "Noida, Delhi, Greater Noida",
      coordinates: {
        type: "circle",
        center: { lat: 28.5355, lng: 77.391 },
        radiusKm: 25,
        points: [
          { lat: 28.65, lng: 77.2 },
          { lat: 28.65, lng: 77.5 },
          { lat: 28.45, lng: 77.5 },
          { lat: 28.45, lng: 77.2 },
        ],
      },
      category_ids: categories.map((c) => c.id),
      status: "Active",
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleStartEdit = (zone: ZoneData) => {
    setCurrentZone({
      ...zone,
      coordinates: zone.coordinates || {
        type: "circle",
        center: { lat: 28.5355, lng: 77.391 },
        radiusKm: 25,
      },
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleToggleCategory = (catId: number) => {
    setCurrentZone((prev) => {
      const exists = prev.category_ids.includes(catId);
      const nextIds = exists
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId];
      return { ...prev, category_ids: nextIds };
    });
  };

  const handleSelectAllCategories = () => {
    setCurrentZone((prev) => ({
      ...prev,
      category_ids: categories.map((c) => c.id),
    }));
  };

  const handleClearAllCategories = () => {
    setCurrentZone((prev) => ({
      ...prev,
      category_ids: [],
    }));
  };

  // Preset location helper
  const applyPreset = (name: string, lat: number, lng: number, radiusKm: number, cities: string) => {
    setCurrentZone((prev) => ({
      ...prev,
      name: prev.name || `${name} Zone`,
      city_names: cities,
      coordinates: {
        ...prev.coordinates,
        center: { lat, lng },
        radiusKm,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentZone.name.trim()) {
      setMessage({ type: "error", text: "Zone name is required." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await saveZone(currentZone);
      if (res.success) {
        setMessage({ type: "success", text: "Zone saved successfully!" });
        setIsEditing(false);
        // Refresh local zones list
        const resList = await fetch("/api/admin/zones-list").catch(() => null);
        if (resList && resList.ok) {
          const data = await resList.json();
          setZones(data.zones || []);
        } else {
          // Optimistic update
          setZones((prev) => {
            if (currentZone.id) {
              return prev.map((z) => (z.id === currentZone.id ? currentZone : z));
            }
            return [{ ...currentZone, id: Date.now() }, ...prev];
          });
        }
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save zone." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save zone." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this zone?")) return;

    try {
      const res = await deleteZone(id);
      if (res.success) {
        setZones((prev) => prev.filter((z) => z.id !== id));
        if (isEditing && currentZone.id === id) {
          setIsEditing(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 font-sans bg-gray-50 min-h-screen text-[13px]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
              <Link href="/admin" className="hover:text-blue-600 transition">Admin</Link>
              <span>/</span>
              <Link href="/admin/categories" className="hover:text-blue-600 transition">Categories</Link>
              <span>/</span>
              <span>Zones</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Zones (Draw Areas on Map)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Define service zones on the map and associate categories available in each zone.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={handleStartCreate}
                className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Zone</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Zone Editor Modal / Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {currentZone.id ? `Edit Zone: ${currentZone.name}` : "Create New Zone"}
                </h2>
                <p className="text-xs text-gray-500">Configure zone boundary and mapped service categories</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold px-3 py-1 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Basic Details & Presets */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs">Zone Name *</label>
                  <input
                    type="text"
                    required
                    value={currentZone.name}
                    onChange={(e) => setCurrentZone({ ...currentZone, name: e.target.value })}
                    placeholder="e.g. Zone 1 (Noida & Delhi NCR)"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs">Service Cities / Locations (Comma-separated)</label>
                  <input
                    type="text"
                    value={currentZone.city_names}
                    onChange={(e) => setCurrentZone({ ...currentZone, city_names: e.target.value })}
                    placeholder="e.g. Noida, Greater Noida, Delhi, Ghaziabad"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Quick Location Presets:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("Noida / Delhi NCR", 28.5355, 77.391, 30, "Noida, Greater Noida, Delhi, Ghaziabad")}
                      className="bg-indigo-50 hover:bg-indigo-100 text-[#6b62d9] font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100 transition"
                    >
                      📍 Noida / NCR
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("Delhi Central", 28.6139, 77.209, 20, "Delhi, New Delhi, East Delhi")}
                      className="bg-indigo-50 hover:bg-indigo-100 text-[#6b62d9] font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100 transition"
                    >
                      📍 Delhi
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("Agra", 27.1767, 78.0081, 20, "Agra, Sikandra, Tajganj")}
                      className="bg-indigo-50 hover:bg-indigo-100 text-[#6b62d9] font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100 transition"
                    >
                      📍 Agra
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("Greater Noida", 28.4744, 77.504, 20, "Greater Noida, Pari Chowk, Knowledge Park")}
                      className="bg-indigo-50 hover:bg-indigo-100 text-[#6b62d9] font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100 transition"
                    >
                      📍 Greater Noida
                    </button>
                  </div>
                </div>

                {/* Coordinates & Radius Settings */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-xs">Area Boundary Coordinates</span>
                    <span className="text-[11px] font-semibold text-[#6b62d9]">Radius: {currentZone.coordinates?.radiusKm || 25} km</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold block mb-1">Center Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={currentZone.coordinates?.center?.lat || 28.5355}
                        onChange={(e) =>
                          setCurrentZone({
                            ...currentZone,
                            coordinates: {
                              ...currentZone.coordinates,
                              center: {
                                ...(currentZone.coordinates?.center || { lng: 77.391 }),
                                lat: parseFloat(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold block mb-1">Center Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={currentZone.coordinates?.center?.lng || 77.391}
                        onChange={(e) =>
                          setCurrentZone({
                            ...currentZone,
                            coordinates: {
                              ...currentZone.coordinates,
                              center: {
                                ...(currentZone.coordinates?.center || { lat: 28.5355 }),
                                lng: parseFloat(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 font-bold block mb-1">Coverage Radius (Km)</label>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={currentZone.coordinates?.radiusKm || 25}
                      onChange={(e) =>
                        setCurrentZone({
                          ...currentZone,
                          coordinates: {
                            ...currentZone.coordinates,
                            radiusKm: parseInt(e.target.value) || 15,
                          },
                        })
                      }
                      className="w-full accent-[#6b62d9]"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs">Zone Status</label>
                  <select
                    value={currentZone.status}
                    onChange={(e) => setCurrentZone({ ...currentZone, status: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Active">Active (Enabled for users)</option>
                    <option value="Inactive">Inactive (Temporarily disabled)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Interactive Map Preview */}
              <div className="space-y-2 flex flex-col">
                <label className="font-bold text-gray-700 text-xs flex items-center justify-between">
                  <span>Interactive Map Area Preview</span>
                  <span className="text-gray-400 font-normal text-[11px]">Center: {currentZone.coordinates?.center?.lat?.toFixed(3)}, {currentZone.coordinates?.center?.lng?.toFixed(3)}</span>
                </label>
                
                <div className="w-full flex-1 min-h-[300px] border border-gray-300 rounded-xl overflow-hidden shadow-inner relative bg-gray-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${currentZone.coordinates?.center?.lat || 28.5355},${currentZone.coordinates?.center?.lng || 77.391}&z=11&output=embed`}
                    width="100%"
                    height="100%"
                    className="min-h-[280px] filter invert-[90%] hue-rotate-[180deg] contrast-[90%] brightness-[95%] grayscale-[10%]"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Zone Map"
                  ></iframe>
                </div>
              </div>

            </div>

            {/* Category Association Section */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Assign Categories & Services to this Zone
                  </h3>
                  <p className="text-xs text-gray-500">
                    Only selected categories will be shown to users within this Zone boundary.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-blue-50 rounded"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllCategories}
                    className="text-xs text-gray-600 hover:text-gray-800 font-bold px-2 py-1 bg-gray-100 rounded"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const isChecked = currentZone.category_ids.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center space-x-3 ${
                        isChecked
                          ? "bg-indigo-50/80 border-[#6b62d9] shadow-sm text-gray-900"
                          : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                          isChecked
                            ? "bg-[#6b62d9] text-white border-[#6b62d9]"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate">{cat.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{cat.type || "Service"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2962ff] hover:bg-[#1e4ad8] disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Zone"}</span>
              </button>
            </div>

          </form>
        )}

        {/* Existing Zones List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Active & Configured Zones ({zones.length})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {zones.length > 0 ? (
              zones.map((zone, idx) => (
                <div key={zone.id || idx} className="p-5 hover:bg-gray-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-gray-900 text-base">{zone.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          zone.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {zone.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {zone.city_names || "Noida / Delhi NCR"}
                      </span>
                      <span>•</span>
                      <span>Radius: {zone.coordinates?.radiusKm || 25} km</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600">
                        {zone.category_ids?.length || 0} Categories Assigned
                      </span>
                    </div>

                    {/* Assigned Category Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {categories
                        .filter((c) => zone.category_ids?.includes(c.id))
                        .map((c) => (
                          <span
                            key={c.id}
                            className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {c.title}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <button
                      onClick={() => handleStartEdit(zone)}
                      className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <Layers className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-medium">No service zones created yet.</p>
                <button
                  onClick={handleStartCreate}
                  className="bg-[#2962ff] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
                >
                  Create Your First Zone
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
