"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  X,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  User,
  Phone,
  Calendar,
  Clock,
  Package,
  IndianRupee,
  Navigation,
  Sparkles,
  CreditCard,
} from "lucide-react";

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
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const address = booking.address || "Address not provided";
  const categoryName = booking.category || booking.type || "Service";

  // Geocode address to get accurate coordinates when modal opens
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
      servicesSection = `*Service:* *${s.title}*${qty > 1 ? ` (Item: ${qty})` : ""} - *Rs.${Math.round(price * qty)}*`;
    } else {
      servicesSection =
        `*Services:*\n` +
        booking.services
          .map((s: any) => {
            const qty = Number(s.quantity) || 1;
            const price = Number(s.price) || 0;
            return `• *${s.title}*${qty > 1 ? ` (Item: ${qty})` : ""} - *Rs.${Math.round(price * qty)}*`;
          })
          .join("\n");
    }
  } else {
    servicesSection = `*Service:* *${categoryName}*`;
  }

  // Map link for WhatsApp
  const mapLink = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const whatsappText = `*OMAA COMPANY - NEW BOOKING*
----------------------------------------
*Category:* *${categoryName}*
*Customer:* *${booking.customer_name}*
*Mobile:* *+91 ${booking.mobile}*
${servicesSection}
*Total Amount:* *Rs.${booking.total}*
*Slot Time:* *${booking.time_slot || "—"}*
*Date:* *${formattedDate}*
*Address:* ${address}
*Map:* ${mapLink}
----------------------------------------`;

  // WhatsApp URL without hardcoded number - opens contact picker in WhatsApp
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <>
      {/* Trigger Button with Stylish Micro-Animation */}
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setClickPos({ x: rect.left, y: rect.bottom + 8 });
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 hover:from-indigo-600 hover:to-violet-600 hover:text-white border border-indigo-200/90 text-[11px] font-extrabold tracking-tight transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] mt-1.5 group"
        title="View Address & Live Location"
      >
        <MapPin className="w-3 h-3 text-indigo-500 group-hover:text-white transition-colors" />
        <span>View Location</span>
      </button>

      {/* Modal Overlay */}
      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-transparent" onClick={() => setOpen(false)} />
          <div 
            className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md rounded-t-[28px] z-10">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
                  <Navigation className="w-3 h-3" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-black text-slate-900 tracking-tight leading-tight">Booking Dispatch</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                    <span>Order #{booking.order_id}</span>
                    <span>•</span>
                    <span className="text-violet-600 font-bold">{categoryName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 space-y-3">

              {/* ── TOP PRIMARY ACTIONS (Send WhatsApp & Google Maps) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[13px] font-black transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[13px] font-black transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
              
              {/* Category Highlight Ribbon */}
              <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-100">Category</span>
                </div>
                <span className="text-[13px] font-black tracking-tight">{categoryName}</span>
              </div>

              {/* Customer & Mobile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-slate-50 to-gray-50/70 rounded-lg p-2.5 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                    <User className="w-3 h-3 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Customer Name</span>
                  </div>
                  <p className="text-[14px] font-black text-slate-900 tracking-tight truncate">{booking.customer_name}</p>
                </div>
                
                <div className="bg-gradient-to-br from-slate-50 to-gray-50/70 rounded-lg p-2.5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Direct Call</span>
                  </div>
                  <a
                    href={`tel:${booking.mobile}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-black tracking-wide shadow-sm hover:shadow transition-all active:scale-95"
                    title={`Click to Call ${booking.customer_name}`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Service Address Card */}
              <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50/80 rounded-lg p-3 border border-blue-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Service Address</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-800 leading-relaxed font-sans">{address}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm transition-all active:scale-95"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600 font-bold" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Compact Google Maps Embed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>Live GPS Map</span>
                  </p>
                  {coords && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ● Live Coords
                    </span>
                  )}
                </div>
                
                {/* Compact Map Box (160px height) */}
                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative">
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
              <div className="bg-slate-50/90 rounded-lg p-3 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-2">
                  <span>Order Summary</span>
                  <span className="text-slate-900 font-black bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">{categoryName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 text-[12px] pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold truncate">
                    <Package className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{Array.isArray(booking.services) && booking.services.length > 0 ? booking.services[0].title : categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                    <IndianRupee className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-black text-slate-900 text-[14px]">₹{booking.total}</span>
                  </div>
                  {booking.booking_date && (
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {booking.time_slot && (
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{booking.time_slot}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
