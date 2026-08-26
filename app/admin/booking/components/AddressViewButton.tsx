"use client";

import { useState, useEffect } from "react";
import { MapPin, X, MessageCircle, ExternalLink, Copy, Check, User, Phone, Calendar, Clock, Package, IndianRupee, Layers, Navigation } from "lucide-react";

interface AddressModalProps {
  booking: {
    id: number;
    order_id: string;
    customer_name: string;
    mobile: string;
    address: string;
    category?: string;
    type?: string;
    total: number | string;
    booking_date: string;
    time_slot: string;
    services: any[];
    payment_method: string;
    working_status: string;
  };
}

export default function AddressViewButton({ booking }: AddressModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const address = booking.address || "Address not provided";
  const categoryName = booking.category || booking.type || "Service";

  // Geocode address to get accurate lat/long coordinates when modal opens
  useEffect(() => {
    if (!open || coords) return;
    fetch(`/api/location/search?q=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((data) => {
        const first = (data.results || data.data || [])[0];
        if (first?.lat && first?.lon) {
          setCoords({ lat: Number(first.lat), lon: Number(first.lon) });
        }
      })
      .catch(() => {});
  }, [open, address, coords]);

  // Maps Navigation and Search URLs
  const googleMapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const mapsEmbedUrl = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lon}&output=embed&z=15`
    : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=14`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Format date as DD-Mon-YYYY
  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")
    : "—";

  // Full service list formatted cleanly for WhatsApp
  let servicesSection = "";
  if (Array.isArray(booking.services) && booking.services.length > 0) {
    if (booking.services.length === 1) {
      const s = booking.services[0];
      const qty = Number(s.quantity) || 1;
      const price = Number(s.price) || 0;
      servicesSection = `🛠 *Service:* ${s.title}${qty > 1 ? ` (Qty: ${qty})` : ""} - Rs.${price * qty}`;
    } else {
      servicesSection =
        `🛠 *Services:*\n` +
        booking.services
          .map((s: any) => {
            const qty = Number(s.quantity) || 1;
            const price = Number(s.price) || 0;
            return `  • ${s.title}${qty > 1 ? ` (Qty: ${qty})` : ""} - Rs.${price * qty}`;
          })
          .join("\n");
    }
  } else {
    servicesSection = `🛠 *Service:* ${categoryName}`;
  }

  // Map link for WhatsApp
  const mapLink = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const whatsappText = `*OMAA Company New Booking* ⚡
*Category:* ${categoryName}

👤 *Name:* ${booking.customer_name}
📱 *Mobile:* +91 ${booking.mobile}
${servicesSection}
💰 *Total:* Rs.${booking.total}

⏰ *Slot Time:* ${booking.time_slot || "—"}
📅 *Date:* ${formattedDate}
📍 *Address:* ${address}
🗺️ *Map Location:* ${mapLink}`;

  // WhatsApp URL without hardcoded number - opens contact picker in WhatsApp
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 text-[11px] font-bold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 mt-1"
        title="View Address & Live Location"
      >
        <MapPin className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
        <span>View Location</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 leading-snug tracking-tight">Booking Location & Details</h2>
                  <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1.5">
                    <span>Order #{booking.order_id}</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-bold">{categoryName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Customer & Mobile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50/80 rounded-2xl p-3.5 border border-gray-100/90 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Customer Name</span>
                  </div>
                  <p className="text-[14px] font-black text-gray-900 tracking-tight truncate">{booking.customer_name}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-slate-50/80 rounded-2xl p-3.5 border border-gray-100/90 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Mobile Number</span>
                  </div>
                  <a
                    href={`tel:${booking.mobile}`}
                    className="text-[14px] font-black text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    +91 {booking.mobile}
                  </a>
                </div>
              </div>

              {/* Service Address Card */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-2xl p-4 border border-blue-100/80 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Delivery / Service Address</span>
                    </div>
                    <p className="text-[13px] font-bold text-gray-800 leading-relaxed">{address}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm transition-all"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Compact Google Maps Embed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Live Map Preview</span>
                  </p>
                  {coords && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      GPS Linked ✓
                    </span>
                  )}
                </div>
                
                {/* Compact Map Box (160px height) */}
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 relative">
                  <iframe
                    src={mapsEmbedUrl}
                    width="100%"
                    height="160"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                  />
                </div>
              </div>

              {/* Booking Summary Highlights */}
              <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-200/50 pb-1.5">
                  <span>Booking Overview</span>
                  <span className="text-gray-900 font-bold bg-white px-2 py-0.5 rounded border border-gray-200">{categoryName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 text-[12px] pt-1">
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium truncate">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{Array.isArray(booking.services) && booking.services.length > 0 ? booking.services[0].title : categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-black text-gray-900 text-[13px]">₹{booking.total}</span>
                  </div>
                  {booking.booking_date && (
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {booking.time_slot && (
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{booking.time_slot}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white text-[13px] font-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
