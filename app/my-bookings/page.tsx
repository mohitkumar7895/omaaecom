"use client";

import Navbar from "../components/Navbar";
import { 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  List, 
  User, 
  Phone, 
  CheckCircle2, 
  FileText, 
  ReceiptText,
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CashbackFeatures from "../components/CashbackFeatures";

interface BookingService {
  title?: string;
  quantity?: number;
  price?: number;
}

interface Booking {
  id?: number;
  order_id: string;
  customer_name?: string;
  mobile?: string;
  working_status?: string;
  created_at: string | Date;
  services?: BookingService[] | string;
  category?: string;
  total?: number;
  booking_date?: string | Date;
  time_slot?: string;
  address?: string;
  coupon_code?: string;
  coupon_status?: string;
  payment_status?: string;
  type?: string;
  warranty_start?: string;
  warranty_end?: string;
  warranty_days_valid?: number;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          
          if (user) {
            const bRes = await fetch("/api/bookings/my-bookings");
            if (!bRes.ok) throw new Error("Unable to load your bookings");
            const { bookings } = await bRes.json() as { bookings?: Booking[] };
            setBookings(bookings || []);
            
            // Expand first booking by default
            if (bookings && bookings.length > 0) {
              setExpandedOrders({ [bookings[0].order_id]: true });
            }
          }
        } else {
          setLoadError("Unable to load your account");
        }
      } catch (error) {
        console.error("Failed to load bookings", error);
        setLoadError("Unable to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Filter bookings based on status
  const filteredBookings = bookings.filter(b => {
    const status = (b.working_status || "Pendi").trim().toLowerCase();
    if (activeTab === "Upcoming") {
      return status === "pendi" || status === "pending" || status === "" || (!["complete", "completed", "reject", "cancelled", "cancel"].includes(status));
    }
    if (activeTab === "Completed") {
      return status === "complete" || status === "completed";
    }
    if (activeTab === "Cancelled") {
      return status === "reject" || status === "cancelled" || status === "cancel";
    }
    return true;
  });

  const upcomingCount = bookings.filter(b => {
    const s = (b.working_status || "Pendi").trim().toLowerCase();
    return s === "pendi" || s === "pending" || s === "" || (!["complete", "completed", "reject", "cancelled", "cancel"].includes(s));
  }).length;

  const completedCount = bookings.filter(b => {
    const s = (b.working_status || "").trim().toLowerCase();
    return s === "complete" || s === "completed";
  }).length;

  const cancelledCount = bookings.filter(b => {
    const s = (b.working_status || "").trim().toLowerCase();
    return s === "reject" || s === "cancelled" || s === "cancel";
  }).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#ff8000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
            <div className="w-20 h-20 bg-[#fde5e5] rounded-full flex items-center justify-center text-red-500 mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Please Login</h1>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">You must be logged in to view your bookings.</p>
            <Link href="/login">
              <button className="mt-8 bg-[#ff8000] hover:bg-[#e67300] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 pb-16">
        
        {/* Top Filter Buttons (Upcoming, Completed, Cancelled) */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar">
          
          <button 
            onClick={() => setActiveTab("Upcoming")}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center gap-1.5 ${
              activeTab === "Upcoming"
                ? "bg-[#ff8000] text-white shadow-md shadow-orange-500/20"
                : "bg-orange-50/60 text-orange-800 hover:bg-orange-100/70 border border-orange-100/60"
            }`}
          >
            Upcoming
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === "Upcoming" ? "bg-white/20 text-white" : "bg-orange-200/60 text-orange-900"
            }`}>
              {upcomingCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("Completed")}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center gap-1.5 ${
              activeTab === "Completed"
                ? "bg-[#10b981] text-white shadow-md shadow-emerald-500/20"
                : "bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-100"
            }`}
          >
            Completed
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === "Completed" ? "bg-white/20 text-white" : "bg-emerald-200/60 text-emerald-900"
            }`}>
              {completedCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("Cancelled")}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center gap-1.5 ${
              activeTab === "Cancelled"
                ? "bg-[#ef4444] text-white shadow-md shadow-red-500/20"
                : "bg-red-50/80 text-red-700 hover:bg-red-100/80 border border-red-100"
            }`}
          >
            Cancelled
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === "Cancelled" ? "bg-white/20 text-white" : "bg-red-200/60 text-red-900"
            }`}>
              {cancelledCount}
            </span>
          </button>

        </div>

        {loadError ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-red-100 p-6 flex flex-col items-center justify-center text-center min-h-[25vh]">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-3 border border-red-100">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Could not load bookings</h2>
            <p className="text-gray-500 text-xs">{loadError}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[25vh]">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-1">No {activeTab} bookings</h2>
            <p className="text-gray-500 text-xs max-w-sm mx-auto mb-4">
              You don&apos;t have any {activeTab.toLowerCase()} appointments right now.
            </p>
            {activeTab === "Upcoming" && (
              <Link href="/">
                <button className="bg-gray-900 hover:bg-black text-white font-bold py-2 px-5 rounded-lg transition shadow-sm text-xs">
                  Book a Service
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBookings.map((booking) => {
              const isExpanded = !!expandedOrders[booking.order_id];
              const isComplete = booking.working_status === "Complete" || booking.working_status === "Completed";
              const isReject = booking.working_status === "Reject" || booking.working_status === "Cancelled";

              const formattedDate = booking.booking_date 
                ? new Date(booking.booking_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) 
                : new Date(booking.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

              return (
                <div 
                  key={booking.order_id} 
                  className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                >
                  
                  {/* Top Header Row */}
                  <div className="p-3.5 sm:p-4 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-gray-100">
                      
                      {/* Customer Info */}
                      <div className="flex items-center gap-3 flex-wrap text-xs font-semibold text-gray-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-orange-500" />
                          <span className="font-bold text-gray-900 text-sm">{booking.customer_name || "Customer"}</span>
                        </div>
                        {booking.mobile && (
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <Phone className="w-3 h-3 fill-blue-600" />
                            <span>{booking.mobile}</span>
                          </div>
                        )}
                        <span className="text-[11px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">#{booking.order_id}</span>
                      </div>

                      {/* Status Tag and Claim Cashback Button */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isComplete 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isReject 
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {isComplete ? "Completed" : isReject ? "Cancelled" : "Confirmed"}
                        </span>

                        {/* Claim Cashback button strictly for RO AMC and New Products */}
                        {isComplete && (booking.type === 'AMC' || booking.type === 'New Product') && (
                          <CashbackFeatures 
                            orderId={booking.order_id} 
                            isEligible={true}
                          />
                        )}
                      </div>

                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-3 bg-gray-50/60 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">CATEGORY</span>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {booking.category || booking.type || "Home Service"}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">BOOKING DATE</span>
                        <div className="font-semibold text-gray-800 text-xs">
                          {formattedDate}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">BOOKING TIME</span>
                        <div className="font-semibold text-gray-800 text-xs">
                          {booking.time_slot || "06:43 PM"}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-2.5 text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">ADDRESS</span>
                      <p className="text-xs font-normal text-gray-600 leading-relaxed line-clamp-2">
                        {booking.address || "Address not specified"}
                      </p>
                    </div>

                    {/* Complete Work Date (if completed) */}
                    {isComplete && (
                      <div className="mb-2.5 text-xs flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">COMPLETE WORK DATE:</span>
                        <span className="text-xs font-bold text-gray-800">{formattedDate}</span>
                      </div>
                    )}

                    {/* View / Hide Details Toggle */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => toggleOrderDetails(booking.order_id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#6366f1] hover:text-[#4f46e5] transition py-0.5"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            View Details
                          </>
                        )}
                      </button>

                      {/* Total Preview if closed */}
                      {!isExpanded && booking.total !== undefined && (
                        <div className="text-xs font-bold text-gray-800">
                          Total: <span className="text-emerald-600 text-sm font-black">₹{Number(booking.total || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Collapsible Details Content */}
                  {isExpanded && (
                    <div className="p-3.5 sm:p-4 bg-[#fafbfc] border-t border-gray-100 space-y-3 animate-in fade-in duration-150">
                      
                      {/* Warranty Details Box */}
                      {isComplete && (booking.warranty_start || booking.warranty_days_valid) && (
                        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-2xs">
                          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-50 pb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                            <span>Warranty Details</span>
                          </div>
                          <div className="space-y-1.5 text-xs text-gray-700">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Warranty Period</span>
                              <span className="font-bold text-gray-900">
                                {booking.warranty_days_valid || 180} days
                              </span>
                            </div>
                            {booking.warranty_start && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Start Date</span>
                                <span className="font-bold text-gray-900">
                                  {new Date(booking.warranty_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                            {booking.warranty_end && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">End Date</span>
                                <span className="font-bold text-emerald-600">
                                  {new Date(booking.warranty_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Summary Box */}
                      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-2xs relative">
                        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-50 pb-1">
                          <ReceiptText className="w-3.5 h-3.5 text-gray-500" />
                          <span>Payment Summary</span>
                        </div>

                        {/* Highlighted Coupon Box inside Payment Summary if available */}
                        {booking.coupon_code && (
                          <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-2 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-700 font-bold text-xs">🎫 Coupon Code</span>
                            </div>
                            <span className="font-mono font-extrabold text-amber-900 text-xs tracking-wider">
                              {booking.coupon_code}
                            </span>
                          </div>
                        )}

                        {/* Services itemized */}
                        {Array.isArray(booking.services) && booking.services.length > 0 ? (
                          <div className="space-y-1 mb-2.5">
                            {booking.services.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-xs py-0.5">
                                <span className="font-medium text-gray-700">{item.title}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-[11px] text-gray-400 font-semibold">Qty: {item.quantity || 1}</span>
                                  <span className="font-bold text-gray-900">₹{Number(item.price || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}

                            {/* Convenience Fee Row */}
                            <div className="flex justify-between items-center text-[11px] py-1 border-t border-gray-50 pt-1.5">
                              <span className="font-medium text-gray-500">Convenience Fee</span>
                              <span className="font-semibold text-gray-800">₹49</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-xs py-1 mb-2">
                            <span className="font-medium text-gray-700">{booking.category || "Service Charge"}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-[11px] text-gray-400 font-semibold">Qty: 1</span>
                              <span className="font-bold text-gray-900">₹{Number(booking.total || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* Total Amount and Payment Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="font-bold text-xs sm:text-sm text-gray-700">Total Amount:</span>
                          <span className="font-black text-lg sm:text-xl text-emerald-600">
                            ₹{Number(booking.total || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Paid Stamp Graphic at Bottom Right */}
                        {isComplete && (booking.payment_status === "Completed" || booking.payment_status === "Success" || booking.payment_status === "Paid" || Number(booking.total) > 0) && (
                          <div className="flex justify-end mt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src="/paid.svg" 
                              alt="PAID THANK YOU" 
                              className="w-14 h-14 sm:w-16 sm:h-16 object-contain select-none hover:scale-105 transition-transform" 
                            />
                          </div>
                        )}

                      </div>

                      {/* Invoice Link */}
                      {isComplete && (
                        <div className="flex justify-start pt-1">
                          <Link href={`/invoice/${booking.order_id}`}>
                            <button className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs">
                              <FileText className="w-3.5 h-3.5" />
                              Invoice
                            </button>
                          </Link>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}