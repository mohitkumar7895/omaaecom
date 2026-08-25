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
  ReceiptText 
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
      
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-2 sm:mt-4 pb-20">
        
        {/* Top Filter Buttons (Upcoming, Completed, Cancelled) */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8 overflow-x-auto pb-1 custom-scrollbar">
          
          <button 
            onClick={() => setActiveTab("Upcoming")}
            className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-xs flex items-center gap-2 ${
              activeTab === "Upcoming"
                ? "bg-[#ff8000] text-white shadow-md shadow-orange-500/20"
                : "bg-orange-50/60 text-orange-800 hover:bg-orange-100/70 border border-orange-100/60"
            }`}
          >
            Upcoming
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === "Upcoming" ? "bg-white/20 text-white" : "bg-orange-200/60 text-orange-900"
            }`}>
              {upcomingCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("Completed")}
            className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-xs flex items-center gap-2 ${
              activeTab === "Completed"
                ? "bg-[#10b981] text-white shadow-md shadow-emerald-500/20"
                : "bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-100"
            }`}
          >
            Completed
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === "Completed" ? "bg-white/20 text-white" : "bg-emerald-200/60 text-emerald-900"
            }`}>
              {completedCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("Cancelled")}
            className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-xs flex items-center gap-2 ${
              activeTab === "Cancelled"
                ? "bg-[#ef4444] text-white shadow-md shadow-red-500/20"
                : "bg-red-50/80 text-red-700 hover:bg-red-100/80 border border-red-100"
            }`}
          >
            Cancelled
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === "Cancelled" ? "bg-white/20 text-white" : "bg-red-200/60 text-red-900"
            }`}>
              {cancelledCount}
            </span>
          </button>

        </div>

        {loadError ? (
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-red-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[35vh]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-4 border border-red-100">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Could not load bookings</h2>
            <p className="text-gray-500 text-sm">{loadError}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center min-h-[35vh]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">No {activeTab} bookings</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              You don&apos;t have any {activeTab.toLowerCase()} appointments right now.
            </p>
            {activeTab === "Upcoming" && (
              <Link href="/">
                <button className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-7 rounded-xl transition shadow-sm text-sm">
                  Book a Service
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
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
                  className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-gray-100/90 overflow-hidden transition-all duration-200 hover:border-gray-200 hover:shadow-md"
                >
                  
                  {/* Top Header Row */}
                  <div className="p-5 sm:p-7 border-b border-gray-50 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      
                      {/* Customer Info */}
                      <div className="flex items-center gap-4 flex-wrap text-sm font-semibold text-gray-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-900">{booking.customer_name || "Customer"}</span>
                        </div>
                        {booking.mobile && (
                          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <Phone className="w-4 h-4 fill-blue-600" />
                            <span>{booking.mobile}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400 font-mono">#{booking.order_id}</span>
                      </div>

                      {/* Status Tag */}
                      <div className="self-start sm:self-auto">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isComplete 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isReject 
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isComplete ? "Completed" : isReject ? "Cancelled" : "Confirmed"}
                        </span>
                      </div>

                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">CATEGORY</span>
                        <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                          <span className="text-orange-500 font-black">::</span>
                          <span>{booking.category || booking.type || "Home Service"}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">BOOKING DATE</span>
                        <div className="font-bold text-gray-800 text-sm">
                          {formattedDate}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">BOOKING TIME</span>
                        <div className="font-bold text-gray-800 text-sm">
                          {booking.time_slot || "06:43 PM"}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">ADDRESS</span>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {booking.address || "Address not specified"}
                      </p>
                    </div>

                    {/* View / Hide Details Toggle */}
                    <div>
                      <button
                        onClick={() => toggleOrderDetails(booking.order_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6366f1] hover:text-[#4f46e5] transition py-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View Details
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Collapsible Details Content */}
                  {isExpanded && (
                    <div className="p-5 sm:p-7 bg-[#fafbfc] border-t border-gray-100 space-y-5 animate-in fade-in duration-200">
                      


                      {/* Payment Summary Box */}
                      <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-xs">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-50 pb-2">
                          <ReceiptText className="w-4 h-4 text-gray-500" />
                          <span>Payment Summary</span>
                        </div>

                        {/* Services itemized */}
                        {Array.isArray(booking.services) && booking.services.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {booking.services.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm py-1">
                                <span className="font-medium text-gray-700">{item.title}</span>
                                <div className="flex items-center gap-6">
                                  <span className="text-xs text-gray-400 font-semibold">Qty: {item.quantity || 1}</span>
                                  <span className="font-bold text-gray-900">₹{Number(item.price || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-sm py-1 mb-4">
                            <span className="font-medium text-gray-700">{booking.category || "Service Charge"}</span>
                            <div className="flex items-center gap-6">
                              <span className="text-xs text-gray-400 font-semibold">Qty: 1</span>
                              <span className="font-bold text-gray-900">₹{Number(booking.total || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* Total Amount and Payment Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-[#10b981]">Total Amount:</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              booking.payment_status === "Completed" || booking.payment_status === "Success" || booking.payment_status === "Paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {booking.payment_status === "Completed" || booking.payment_status === "Success" || booking.payment_status === "Paid" 
                                ? "Payment Completed" 
                                : "Payment Pending"}
                            </span>

                            <span className="font-black text-xl text-emerald-600">
                              ₹{Number(booking.total || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Coupon Code Section (if any) */}
                      {booking.coupon_code && (
                        <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase block">Your Discount Coupon</span>
                            <span className="text-sm font-bold text-indigo-900 font-mono">{booking.coupon_code}</span>
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold">10% OFF applicable on next booking</span>
                        </div>
                      )}

                      {/* Cashback / Invoice features when complete */}
                      {isComplete && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                          {(booking.type === 'AMC' || booking.type === 'New Product') && (
                            <CashbackFeatures 
                              orderId={booking.order_id} 
                              isEligible={true}
                            />
                          )}
                          <Link href={`/invoice/${booking.order_id}`} className="sm:ml-auto w-full sm:w-auto">
                            <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
                              <FileText className="w-4 h-4" />
                              View Invoice
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