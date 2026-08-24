"use client";

import Navbar from "../components/Navbar";
import { Clock, XCircle, Navigation, FileText, Calendar, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CashbackFeatures from "../components/CashbackFeatures";

interface BookingService {
  title?: string;
  quantity?: number;
  price?: number;
}

interface Booking {
  order_id: string;
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
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#6069c9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
            <div className="w-20 h-20 bg-[#fde5e5] rounded-full flex items-center justify-center text-red-500 mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Please Login</h1>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">You must be logged in to view your bookings.</p>
            <Link href="/login">
              <button className="mt-8 bg-[#6069c9] hover:bg-[#525ab5] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8 pb-20">
        <div className="flex items-center gap-5 mb-10 mt-2">
          <div className="w-16 h-16 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[20px] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transform hover:scale-105 transition-transform duration-300">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 tracking-tight mb-1">My Bookings</h1>
            <p className="text-gray-500 font-medium text-sm">Track your premium service history</p>
          </div>
        </div>

        {loadError ? (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-red-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-6 border border-red-100">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">Could not load bookings</h2>
            <p className="text-gray-500 max-w-md mx-auto">{loadError}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">No bookings yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">You haven&apos;t booked any services yet. Start exploring our catalog.</p>
            <Link href="/">
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:-translate-y-0.5">
                Explore Services
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden hover:shadow-[0_12px_50px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 relative group">
                
                {/* Status indicator line on the left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                  booking.working_status === 'Complete' ? 'bg-emerald-400' :
                  booking.working_status === 'Reject' ? 'bg-red-400' :
                  'bg-amber-400'
                }`} />

                {/* Header */}
                <div className="border-b border-gray-50/80 p-4 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-linear-to-r from-gray-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm ${
                      booking.working_status === 'Complete' ? 'bg-linear-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border border-emerald-100' :
                      booking.working_status === 'Reject' ? 'bg-linear-to-r from-red-50 to-red-100/50 text-red-700 border border-red-100' :
                      'bg-linear-to-r from-amber-50 to-amber-100/50 text-amber-700 border border-amber-100'
                    }`}>
                      {booking.working_status === 'Pendi' ? 'Pending' : booking.working_status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[11px] sm:text-xs font-semibold">Order ID</span>
                      <span className="text-gray-900 text-xs sm:text-sm font-black font-mono tracking-tight bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-gray-200 shadow-sm">
                        #{booking.order_id}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[11px] sm:text-[12px] font-bold text-gray-400 flex items-center sm:justify-end gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 
                    Placed on {new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-7 flex flex-col md:flex-row gap-4 md:gap-10">
                  <div className="flex-1 space-y-3 sm:space-y-5">
                    <div>
                      <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 sm:mb-3 flex items-center gap-1.5"><List className="w-3.5 h-3.5"/> Services</h3>
                      {Array.isArray(booking.services) ? (
                        <div className="space-y-2 sm:space-y-3 bg-[#f8f9fa] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
                          {booking.services.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6069c9]/40"></div>
                                <span className="font-bold text-gray-800">{s.title}</span>
                                <span className="text-gray-400 text-[11px] font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">x{s.quantity || 1}</span>
                              </div>
                              <span className="font-black text-gray-900">₹{Number(s.price)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-800 bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6069c9]/40"></div>
                          {booking.category || 'Service'}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 sm:pt-2">
                      <div className="flex justify-between items-end p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-linear-to-br from-gray-900 to-black text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-xl"></div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
                          <span className="text-[10px] sm:text-xs text-gray-400/80 font-medium">Incl. all taxes</span>
                        </div>
                        <span className="font-black text-xl sm:text-2xl tracking-tight relative z-10">₹{Number(booking.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel / Logistics */}
                  <div className="md:w-75 shrink-0 space-y-3 sm:space-y-4">
                    <div className="bg-[#f8f9fa] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100/80 hover:border-gray-200 transition-colors">
                      <div className="mb-3 sm:mb-5">
                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Schedule</h3>
                        <div className="text-xs sm:text-[14px] font-bold text-gray-900 flex items-center gap-2 bg-white px-2 py-2 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Not Scheduled'} • {booking.time_slot || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5"/> Service Address</h3>
                        <div className="text-xs sm:text-[13px] font-semibold text-gray-600 leading-relaxed bg-white px-2 py-2 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                          {booking.address || 'Online / Remote'}
                        </div>
                      </div>
                    </div>

                    {booking.coupon_code && (booking.type === 'AMC' || booking.type === 'New Product') && (
                      <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors ${
                        booking.coupon_status === 'used'
                          ? 'bg-red-50/50 border-red-100/80 group-hover:bg-red-50'
                          : 'bg-indigo-50/50 border-indigo-100/80 group-hover:bg-indigo-50'
                      }`}>
                        <h3 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 ${
                          booking.coupon_status === 'used' ? 'text-red-400' : 'text-indigo-400'
                        }`}>Your Coupon Code</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`text-[13px] sm:text-[15px] font-black font-mono tracking-wider px-2 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg shadow-sm border ${
                            booking.coupon_status === 'used'
                              ? 'text-red-400 bg-white border-red-200 line-through opacity-60'
                              : 'text-indigo-700 bg-white border-indigo-200'
                          }`}>
                            {booking.coupon_code}
                          </div>
                          {booking.coupon_status === 'used' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600 px-2 py-1 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                              Active
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 font-semibold leading-snug ${
                          booking.coupon_status === 'used'
                            ? 'text-red-400/80'
                            : 'text-indigo-500/80'
                        }`}>
                          {booking.coupon_status === 'used'
                            ? '✓ Coupon used on partner website. Cashback unlocked!'
                            : 'Keep this safe for your next booking!'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Action Buttons (Service, Cashback, Invoice) */}
                {((booking.type === 'AMC' || booking.type === 'New Product') || booking.working_status === 'Complete') && (
                  <div className="p-4 sm:p-5 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row gap-4 sm:items-center relative">
                    
                    {/* Toggle - Centered */}
                    {(booking.type === 'AMC' || booking.type === 'New Product') && (
                      <div className="w-full flex justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                        <CashbackFeatures 
                          orderId={booking.order_id} 
                          isEligible={booking.working_status === 'Complete' && (booking.payment_status === 'Success' || booking.payment_status === 'SUCCESS' || booking.payment_status === 'Completed' || booking.payment_status?.toLowerCase() === 'paid')}
                        />
                      </div>
                    )}
                    
                    {/* Invoice Button - Right Aligned on Desktop */}
                    {booking.working_status === 'Complete' && (
                      <div className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 relative z-10 flex justify-center">
                        <Link href={`/invoice/${booking.order_id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#6069c9] hover:bg-[#525ab5] text-white px-5 py-3 rounded-xl text-sm font-bold transition shadow-sm">
                            <FileText className="w-4 h-4" />
                            View Invoice
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}