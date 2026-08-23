"use client";

import Navbar from "../components/Navbar";
import { Clock, CheckCircle2, XCircle, ChevronRight, Navigation, FileText, Wallet, Calendar, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CashbackFeatures from "../components/CashbackFeatures";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          
          if (user) {
            const bRes = await fetch("/api/bookings/my-bookings");
            if (bRes.ok) {
              const { bookings } = await bRes.json();
              setBookings(bookings || []);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load bookings");
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
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
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
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[20px] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transform hover:scale-105 transition-transform duration-300">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-1">My Bookings</h1>
            <p className="text-gray-500 font-medium text-sm">Track your premium service history</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">No bookings yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">You haven't booked any services yet. Start exploring our catalog.</p>
            <Link href="/">
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:-translate-y-0.5">
                Explore Services
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden hover:shadow-[0_12px_50px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 relative group">
                
                {/* Status indicator line on the left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                  booking.working_status === 'Complete' ? 'bg-emerald-400' :
                  booking.working_status === 'Reject' ? 'bg-red-400' :
                  'bg-amber-400'
                }`} />

                {/* Header */}
                <div className="border-b border-gray-50/80 p-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm ${
                      booking.working_status === 'Complete' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border border-emerald-100' :
                      booking.working_status === 'Reject' ? 'bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 border border-red-100' :
                      'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 border border-amber-100'
                    }`}>
                      {booking.working_status === 'Pendi' ? 'Pending' : booking.working_status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs font-semibold">Order ID</span>
                      <span className="text-gray-900 text-sm font-black font-mono tracking-tight bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                        #{booking.order_id}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[12px] font-bold text-gray-400 flex items-center sm:justify-end gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 
                    Placed on {new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-7 flex flex-col md:flex-row gap-6 md:gap-10">
                  <div className="flex-1 space-y-5">
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5"><List className="w-3.5 h-3.5"/> Services</h3>
                      {Array.isArray(booking.services) ? (
                        <div className="space-y-3 bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100">
                          {booking.services.map((s: any, idx: number) => (
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

                    <div className="pt-2">
                      <div className="flex justify-between items-end p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                        <div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
                          <span className="text-xs text-gray-400/80 font-medium">Incl. all taxes</span>
                        </div>
                        <span className="font-black text-2xl tracking-tight relative z-10">₹{Number(booking.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel / Logistics */}
                  <div className="md:w-[300px] shrink-0 space-y-4">
                    <div className="bg-[#f8f9fa] rounded-2xl p-5 border border-gray-100/80 hover:border-gray-200 transition-colors">
                      <div className="mb-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Schedule</h3>
                        <div className="text-[14px] font-bold text-gray-900 flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Not Scheduled'} • {booking.time_slot || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5"/> Service Address</h3>
                        <div className="text-[13px] font-semibold text-gray-600 leading-relaxed bg-white px-3 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                          {booking.address || 'Online / Remote'}
                        </div>
                      </div>
                    </div>

                    {booking.coupon_code && (
                      <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-5 group-hover:bg-indigo-50 transition-colors">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Your Coupon Code</h3>
                        <div className="flex items-center gap-2">
                          <div className="text-[15px] font-black text-indigo-700 font-mono tracking-wider bg-white border border-indigo-200 px-3 py-2 rounded-lg shadow-sm">
                            {booking.coupon_code}
                          </div>
                        </div>
                        <p className="text-[11px] text-indigo-500/80 mt-2 font-semibold leading-snug">Keep this safe for your next booking!</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Action Buttons (Service & Cashback) */}
                {(booking.type === 'AMC' || booking.type === 'New Product') && (
                  <div className="p-5 border-t border-gray-50 bg-gray-50/30">
                    <CashbackFeatures orderId={booking.order_id} />
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