"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  PackagePlus, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  ShoppingBag, 
  IndianRupee, 
  AlertCircle,
  Save,
  Pencil,
  Layers,
  Sparkles
} from "lucide-react";
import { updateBookingItems } from "../actions";

export interface BookingItem {
  title: string;
  price: number | string;
  quantity: number | string;
}

interface RateCardItem {
  id: string;
  type: string;
  name: string;
  price: number;
  labourCharges: number;
  category: string;
  heading: string;
  displayName: string;
}

interface BookingItemsManagerProps {
  bookingId: number | string;
  orderId: string;
  customerName?: string;
  category?: string;
  bookingType?: string;
  initialServices: any;
  initialTotal: number | string;
}

export default function BookingItemsManager({
  bookingId,
  orderId,
  customerName,
  category,
  bookingType,
  initialServices,
  initialTotal,
}: BookingItemsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate card dropdown options
  const [rateCardOptions, setRateCardOptions] = useState<RateCardItem[]>([]);
  const [loadingRateCards, setLoadingRateCards] = useState(false);

  // Normalize initial items
  const parseInitialItems = (): BookingItem[] => {
    let items = initialServices;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    if (Array.isArray(items) && items.length > 0) {
      return items.map((it: any) => ({
        title: it.title || it.name || "Service Item",
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
      }));
    }
    if (category && category !== "—" && category !== "Service") {
      return [{
        title: category,
        price: Number(initialTotal || 0),
        quantity: 1,
      }];
    }
    return [{
      title: "Service Charge",
      price: Number(initialTotal || 0),
      quantity: 1,
    }];
  };

  const [items, setItems] = useState<BookingItem[]>([]);
  const [customTotal, setCustomTotal] = useState<string>("");
  const [isCustomTotalOverride, setIsCustomTotalOverride] = useState(false);

  // New item draft inputs
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [selectedRateCardId, setSelectedRateCardId] = useState("");

  const openModal = () => {
    const loaded = parseInitialItems();
    setItems(loaded);
    setCustomTotal(String(initialTotal || ""));
    setIsCustomTotalOverride(false);
    setError(null);
    setSaved(false);
    setIsOpen(true);

    // Fetch rate card items if not yet loaded
    if (rateCardOptions.length === 0) {
      setLoadingRateCards(true);
      fetch("/api/admin/rate-cards")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.allItems)) {
            setRateCardOptions(data.allItems);
          }
        })
        .catch((err) => console.error("Error loading rate cards:", err))
        .finally(() => setLoadingRateCards(false));
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
  };

  // Handle selecting an item from the Rate Card dropdown
  const handleRateCardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRateCardId(val);
    if (!val) return;

    const found = rateCardOptions.find((opt) => opt.id === val);
    if (found) {
      setNewTitle(found.name);
      setNewPrice(String(found.price));
      setError(null);
    }
  };

  // Handle editing an existing item
  const updateItemField = (index: number, field: keyof BookingItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Delete item
  const removeItem = (index: number) => {
    if (items.length === 1) {
      setError("Booking must have at least one item.");
      return;
    }
    setError(null);
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Add new item
  const handleAddNewItem = () => {
    if (!newTitle.trim()) {
      setError("Please select from Rate Card or enter an item name.");
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price (₹).");
      return;
    }
    const qtyNum = parseInt(newQuantity) || 1;

    setItems([
      ...items,
      {
        title: newTitle.trim(),
        price: priceNum,
        quantity: qtyNum,
      },
    ]);

    setNewTitle("");
    setNewPrice("");
    setNewQuantity("1");
    setSelectedRateCardId("");
    setError(null);
  };

  // Calculate items subtotal
  const itemsSubtotal = items.reduce((sum, item) => {
    const p = parseFloat(String(item.price)) || 0;
    const q = parseInt(String(item.quantity)) || 1;
    return sum + p * q;
  }, 0);

  // Convenience fee (only normal service has ₹49)
  const isAmcOrProduct = bookingType === "AMC" || bookingType === "New Product";
  const convenienceFee = !isAmcOrProduct ? 49 : 0;
  const autoComputedTotal = itemsSubtotal + convenienceFee;

  const currentTotal = isCustomTotalOverride && customTotal !== "" 
    ? parseFloat(customTotal) || autoComputedTotal
    : autoComputedTotal;

  // Save changes via server action
  const handleSave = () => {
    if (items.length === 0) {
      setError("Please add at least one item.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", String(bookingId));
        formData.append("services", JSON.stringify(items));
        formData.append("total", String(currentTotal));

        const res = await updateBookingItems(formData);
        if (res && res.success === false) {
          setError(res.error || "Failed to save booking items.");
        } else {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            closeModal();
          }, 1000);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while saving.");
      }
    });
  };

  // Filter Rate Card vs Services for grouped options
  const rateCardsGroup = rateCardOptions.filter((it) => it.type === "Rate Card / Spare Part");
  const servicesGroup = rateCardOptions.filter((it) => it.type === "Service");

  return (
    <>
      {/* Trigger Button inside Admin Table */}
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-all border border-indigo-200/80 shadow-2xs cursor-pointer active:scale-95"
        title="Add or edit items and prices from Rate Card or custom"
      >
        <PackagePlus className="w-3.5 h-3.5" />
        <span>+ Add / Edit Items</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-white tracking-tight">
                    Manage Items & Pricing
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Order #{orderId} {customerName ? `• Customer: ${customerName}` : ""}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Existing Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Booking Items ({items.length})
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Edit title, qty or price directly</span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-x-auto w-full shadow-2xs">
                  <table className="w-full min-w-[500px] text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5">Item / Service Title</th>
                        <th className="px-3 py-2.5 text-center w-20">Item</th>
                        <th className="px-3 py-2.5 text-right w-28">Price (₹)</th>
                        <th className="px-3 py-2.5 text-right w-28">Total (₹)</th>
                        <th className="px-2 py-2.5 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item, idx) => {
                        const lineTotal = Math.round((parseFloat(String(item.price)) || 0) * (parseInt(String(item.quantity)) || 1));
                        return (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItemField(idx, "title", e.target.value)}
                                placeholder="Service or product title"
                                className="w-full px-2 py-1 bg-gray-50/80 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                                className="w-16 px-1.5 py-1 text-center bg-gray-50/80 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="relative inline-block w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.price}
                                  onChange={(e) => updateItemField(idx, "price", e.target.value)}
                                  className="w-full pl-5 pr-1.5 py-1 text-right bg-gray-50/80 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-black text-gray-900">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add New Item Box with Rate Card Dropdown */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 uppercase tracking-wider">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Add Extra Item / Spare Part / Service</span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> Auto-fill from Rate Card
                  </span>
                </div>

                {/* Rate Card Dropdown Selector */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Select from Rate Card / Spare Parts / Services
                  </label>
                  <select
                    value={selectedRateCardId}
                    onChange={handleRateCardSelect}
                    disabled={loadingRateCards}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-2xs"
                  >
                    <option value="">
                      {loadingRateCards ? "⏳ Loading Rate Cards..." : "-- Choose from Rate Card or Services (Auto-fills Name & Price) --"}
                    </option>

                    {rateCardsGroup.length > 0 && (
                      <optgroup label="📋 Rate Card Spare Parts">
                        {rateCardsGroup.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.displayName}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {servicesGroup.length > 0 && (
                      <optgroup label="🛠️ Main Services">
                        {servicesGroup.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.displayName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Form Fields: Item Name, Qty, Price */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pt-1 border-t border-indigo-100/80">
                  <div className="sm:col-span-6">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Item / Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gas Refilling, Capacitor, Spare Part"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNewItem()}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Item
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full px-2 py-2 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Price/Unit (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="₹0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNewItem()}
                      className="w-full px-2 py-2 text-right bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-2xs"
                    />
                    {parseInt(newQuantity) > 1 && parseFloat(newPrice) > 0 && (
                      <span className="text-[10px] text-emerald-700 font-black block mt-1 text-right whitespace-nowrap">
                        = ₹{Math.round(parseFloat(newPrice) * parseInt(newQuantity)).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddNewItem}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown & Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-gray-900">₹{Math.round(itemsSubtotal).toLocaleString("en-IN")}</span>
                </div>

                {convenienceFee > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Convenience Fee:</span>
                    <span className="font-bold text-gray-900">₹{Math.round(convenienceFee)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="font-black text-sm text-gray-900 block">Final Booking Total:</span>
                    <span className="text-[10px] text-gray-400">Reflected in My Bookings, Invoice & Receipt</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 font-black">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={isCustomTotalOverride ? customTotal : Math.round(autoComputedTotal)}
                        onChange={(e) => {
                          setIsCustomTotalOverride(true);
                          setCustomTotal(e.target.value);
                        }}
                        className="w-32 pl-6 pr-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-base font-black text-emerald-700 text-right outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  saved 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved Successfully!</span>
                  </>
                ) : isPending ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Booking & Update Total</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
