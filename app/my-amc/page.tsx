"use client";

import Navbar from "../components/Navbar";
import { ShieldCheck, ShieldAlert, FileText, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AmcService {
  title?: string;
  name?: string;
  category?: string;
}

interface AmcBooking {
  id: number | string;
  order_id?: string;
  type?: string;
  services?: AmcService[] | string;
  total?: number | string;
  created_at: string | Date;
  working_status?: string;
  payment_status?: string;
  invoice_status?: string;
}

export default function MyAmcPage() {
  const [amcPlans, setAmcPlans] = useState<AmcBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar />
      
      {/* Green Header Block */}
      <div className="bg-[#18a876] w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 text-white">
          <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My AMC Plans</h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-0.5">Annual Maintenance Contracts & Subscriptions</p>
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
            <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
              <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-[#333] text-lg font-bold mb-1">Please Login</h2>
              <p className="text-gray-500 text-sm mb-6">You must be logged in to view your AMC plans.</p>
              <Link href="/login">
                <button className="bg-[#18a876] hover:bg-[#148f63] text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm">
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        ) : amcPlans.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
            <div className="text-center flex flex-col items-center bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
              <div className="mb-4">
                <ShieldAlert className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
              </div>
              <h2 className="text-[#333333] text-xl font-bold mb-1.5">No AMC Plans</h2>
              <p className="text-[#777777] text-sm mb-6">You haven&apos;t subscribed to any AMC plans yet.</p>
              <Link href="/">
                <button className="bg-[#18a876] hover:bg-[#148f63] text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm">
                  Explore AMC Plans
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amcPlans.map((plan, idx) => {
                const fullOrderId = String(plan.order_id || plan.id);
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Top Status & Icon */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-11 h-11 bg-[#e8f7f1] text-[#18a876] rounded-xl flex items-center justify-center shadow-xs">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200/60 uppercase tracking-wide">
                          {plan.working_status || "Active Plan"}
                        </span>
                      </div>

                      {/* Plan Title */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                        {Array.isArray(plan.services) ? plan.services[0]?.title || plan.services[0]?.name || "RO AMC 1 Year Plan" : "RO AMC 1 Year Plan"}
                      </h3>

                      {/* Full Order ID */}
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Full Order ID
                        </span>
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-800">
                          <span className="truncate mr-2 select-all">{fullOrderId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(fullOrderId)}
                            className="text-gray-400 hover:text-[#18a876] transition shrink-0 p-1 rounded"
                            title="Copy Order ID"
                          >
                            {copiedId === fullOrderId ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Invoice */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Amount Paid</p>
                          <p className="font-black text-gray-900 text-base">₹{Number(plan.total || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Booking Date</p>
                          <p className="font-bold text-gray-800 text-xs mt-0.5">
                            {plan.created_at ? new Date(plan.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }) : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Invoice Link if generated */}
                      {(plan.invoice_status === "Completed" || plan.invoice_status === "Complete" || plan.invoice_status === "Generated") && (
                        <div className="pt-1">
                          <Link href={`/invoice/${fullOrderId}`} className="w-full">
                            <button className="w-full flex items-center justify-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2 rounded-xl text-xs font-bold transition shadow-xs">
                              <FileText className="w-3.5 h-3.5" />
                              View / Download Invoice
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}