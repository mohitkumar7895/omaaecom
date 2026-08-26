"use client";

import { useState } from "react";
import { MapPin, X, MessageCircle, ExternalLink, Copy, Check, User, Phone, Calendar, Clock, Package, IndianRupee } from "lucide-react";

interface AddressModalProps {
  booking: {
    id: number;
    order_id: string;
    customer_name: string;
    mobile: string;
    address: string;
    category: string;
    type: string;
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

  const address = booking.address || "Address not provided";

  // Google Maps search URL from address text
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Google Maps embed iframe URL
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Build WhatsApp message with full booking details
  const servicesText = Array.isArray(booking.services)
    ? booking.services.map((s: any) => `  • ${s.title} × ${s.quantity || 1} = ₹${s.price}`).join("\n")
    : String(booking.services || "—");

  const whatsappText = `Hello ${booking.customer_name} 👋,

Here are your booking details:

🆔 *Order ID:* ${booking.order_id}
📋 *Category:* ${booking.category || booking.type || "—"}
📍 *Service Address:*
${address}

🛠 *Services Booked:*
${servicesText}

💰 *Total Amount:* ₹${booking.total}
💳 *Payment:* ${booking.payment_method}
📅 *Date:* ${booking.booking_date ? new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
⏰ *Time Slot:* ${booking.time_slot || "—"}
✅ *Status:* ${booking.working_status || "Pending"}

Thank you for choosing *OMAA Company*! 🙏
For any queries, contact us at support@omaacompany.com`;

  // WhatsApp URL without number - opens contact picker in WhatsApp
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <>
      {/* View Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 text-[11px] font-bold transition-all hover:shadow-sm mt-1"
        title="View Address & Location"
      >
        <MapPin className="w-3 h-3" />
        View
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-gray-900 leading-tight">Location Details</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Order #{booking.order_id}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</span>
                  </div>
                  <p className="text-[13px] font-bold text-gray-900">{booking.customer_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile</span>
                  </div>
                  <a href={`tel:${booking.mobile}`} className="text-[13px] font-bold text-indigo-600 hover:underline">
                    {booking.mobile}
                  </a>
                </div>
              </div>

              {/* Address Block */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Service Address</span>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{address}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
                    title="Copy address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Customer Location"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Booking Summary</p>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{booking.category || booking.type || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <IndianRupee className="w-3 h-3 text-gray-400" />
                    <span className="font-bold text-gray-900">₹{booking.total}</span>
                  </div>
                  {booking.booking_date && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">
                        {new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  )}
                  {booking.time_slot && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{booking.time_slot}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-all shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Maps
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold transition-all shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
