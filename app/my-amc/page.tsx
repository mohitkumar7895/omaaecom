"use client";

import Navbar from "../components/Navbar";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AmcService {
  title?: string;
  name?: string;
  category?: string;
}

interface AmcBooking {
  id: number | string;
  type?: string;
  services?: AmcService[] | string;
  total?: number | string;
  created_at: string | Date;
}

export default function MyAmcPage() {
  const [amcPlans, setAmcPlans] = useState<AmcBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const fetchAMCs = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          
          if (user) {
            const bRes = await fetch("/api/bookings/my-bookings");
            if (!bRes.ok) throw new Error("Unable to load bookings");
            const { bookings } = await bRes.json() as { bookings?: AmcBooking[] };
            const amcs = (bookings || []).filter((booking) => {
              if (booking.type?.toLowerCase() === "amc") return true;
              if (!Array.isArray(booking.services)) return false;
              return booking.services.some((service) =>
                [service.title, service.name, service.category]
                  .filter(Boolean)
                  .some((value) => value?.toLowerCase().includes("amc"))
              );
            });
            setAmcPlans(amcs);
          }
        }
      } catch (error) {
        console.error("Failed to load AMCs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAMCs();
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      {/* Green Header Block */}
      <div className="bg-[#18a876] w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 text-white">
          <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My AMC Plans</h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-0.5">Annual Maintenance Contracts</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-[#18a876] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
            <div className="text-center">
              <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-[#333] text-lg font-semibold mb-1">Please Login</h2>
              <p className="text-gray-500 text-sm mb-6">You must be logged in to view your AMC plans.</p>
              <Link href="/login">
                <button className="bg-[#18a876] hover:bg-[#148f63] text-white font-medium py-2 px-6 rounded text-sm transition-colors">
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        ) : amcPlans.length === 0 ? (
          // Empty State matching Screenshot exactly
          <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
            <div className="text-center flex flex-col items-center">
              <div className="mb-4">
                <ShieldAlert className="w-15 h-15 text-[#e0e4e8]" strokeWidth={1.5} />
              </div>
              <h2 className="text-[#333333] text-[18px] sm:text-[20px] font-semibold mb-1.5">No AMC Plans</h2>
                <p className="text-[#777777] text-[13px] sm:text-[14px] mb-6">You haven&apos;t subscribed to any AMC plans yet.</p>
              <Link href="/">
                <button className="bg-[#18a876] hover:bg-[#148f63] text-white font-semibold py-2 px-6 rounded text-[13px] transition-colors">
                  Explore AMC Plans
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amcPlans.map((plan, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[#e8f7f1] text-[#18a876] rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100 uppercase">Active</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{Array.isArray(plan.services) ? plan.services[0]?.title || plan.services[0]?.name || "AMC Plan" : "AMC Plan"}</h3>
                  <p className="text-gray-500 text-sm mb-4">Order ID: {plan.id}</p>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Amount Paid</p>
                      <p className="font-bold text-gray-900">₹{Number(plan.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Date</p>
                      <p className="font-bold text-gray-900">{new Date(plan.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}