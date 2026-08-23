"use client";

import Navbar from "../components/Navbar";
import { Clock, CheckCircle2, XCircle, ChevronRight, Navigation, FileText, Wallet } from "lucide-react";
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#e2e5fc] rounded-2xl flex items-center justify-center text-[#6069c9]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500 font-medium">View and manage your service history</p>
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
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                <div className="border-b border-gray-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${
                      booking.working_status === 'Complete' ? 'bg-emerald-100 text-emerald-700' :
                      booking.working_status === 'Reject' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.working_status === 'Pendi' ? 'Pending' : booking.working_status}
                    </span>
                    <span className="text-gray-500 text-xs font-bold font-mono bg-white px-2 py-1 rounded border border-gray-100">
                      ID: {booking.order_id}
                    </span>
                  </div>
                  <div className="text-right text-xs font-bold text-gray-500">
                    Placed on {new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Service Details</h3>
                      {Array.isArray(booking.services) ? (
                        <div className="space-y-2">
                          {booking.services.map((s: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-gray-800">{s.title} <span className="text-gray-400 text-xs ml-1">x{s.quantity || 1}</span></span>
                              <span className="font-bold text-gray-900">₹{Number(s.price)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-800">{booking.category || 'Service'}</div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="font-bold text-gray-500">Total Amount</span>
                        <span className="font-black text-[#6069c9] text-lg">₹{Number(booking.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-[280px] shrink-0 bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 space-y-4">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Schedule</h3>
                      <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#6069c9]" />
                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB') : 'Not Scheduled'} • {booking.time_slot || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Service Address</h3>
                      <div className="text-[13px] font-medium text-gray-600 flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{booking.address || 'Online / Remote'}</span>
                      </div>
                    </div>

                    {booking.coupon_code && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-4">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1">Your Coupon Code</h3>
                        <div className="text-sm font-bold text-indigo-700 font-mono tracking-widest bg-white border border-indigo-200 px-3 py-1.5 rounded inline-block shadow-sm">
                          {booking.coupon_code}
                        </div>
                        <p className="text-[11px] text-indigo-600 mt-1 font-medium">Use this code for your next AMC booking!</p>
                      </div>
                    )}

                    {booking.ad_watched && booking.cashback_amount > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Cashback</span>
                          <span className={`text-[13px] font-black ${booking.working_status === 'Complete' ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {booking.working_status === 'Complete' ? '+₹' + booking.cashback_amount : 'Pending ₹' + booking.cashback_amount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Action Buttons (Service & Cashback) */}
                <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
                  <CashbackFeatures orderId={booking.order_id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}