"use client";

import Navbar from "../components/Navbar";
import { Clock, RefreshCw, Banknote, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CashbackPage() {
  const [balance, setBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Set to 0 to test claiming
  const [history, setHistory] = useState<{ id: number; date: string; details: string; amount: string; status: string }[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClaim = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setBalance((prev) => prev + 10.95);
      setTimeLeft(24 * 60 * 60); // 24 hours
      setHistory((prev) => [
        {
          id: Date.now(),
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          details: "Daily Ad Claim",
          amount: "₹10.95",
          status: "Success",
        },
        ...prev,
      ]);
      setIsClaiming(false);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        
        {/* Top Banner */}
        <div className="bg-[#0f4a46] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden mb-6 flex flex-col justify-center min-h-[140px] shadow-sm">
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-[#73a8a3] mb-2 uppercase">AMC & New Product Benefit</p>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">100% Cashback</h1>
            <p className="text-xs sm:text-sm text-gray-200 max-w-xl">
              Claim cashback after watching a short ad. Once completed, your next claim opens after 24 hours.
            </p>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 text-[100px] sm:text-[140px] font-black text-white/5 select-none pointer-events-none">
            100%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Cashback Service */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Cashback service</h2>
              <p className="text-sm text-gray-500 mb-6">Eligible RO AMC and new product bookings can use this claim cycle.</p>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-[#e6f4f1] p-3 rounded-xl text-[#0f4a46]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Daily cashback claim</h3>
                  <p className="text-xs text-gray-500">₹4,000 service value ÷ 365 days</p>
                </div>
              </div>

              <div className="bg-[#f8fcfb] rounded-xl border border-[#e6f4f1] p-5 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">Next claim timer</span>
                  {timeLeft > 0 ? (
                    <span className="bg-[#e6f4f1] text-[#0a805c] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">WAIT</span>
                  ) : (
                    <span className="bg-[#0a805c] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">READY</span>
                  )}
                </div>
                <div className="mb-4">
                  {timeLeft > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-[#0a805c] mb-1 tabular-nums">{formatTime(timeLeft)}</div>
                      <p className="text-xs text-gray-500">Your 24 hour timer is running. Cashback can be claimed again after it completes.</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-[#0a805c] mb-1">Claim Ready</div>
                      <p className="text-xs text-gray-500">Your timer has completed. You can claim your daily cashback now.</p>
                    </>
                  )}
                </div>
                
                {timeLeft > 0 ? (
                  <button disabled className="w-full bg-[#c9d3d1] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                    <Clock className="w-4 h-4" />
                    Wait {formatTime(timeLeft)}
                  </button>
                ) : (
                  <button 
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full bg-[#0a805c] hover:bg-[#086a4c] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Claim Cashback
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-[#fffcf3] border border-[#f5e6b3] rounded-xl p-4 text-xs text-[#856404]">
                <span className="font-semibold">Daily cashback value: ₹10.95.</span> The claim button opens again after each 24 hour timer completes.
              </div>
            </div>
          </div>

          {/* Right Column - Balance & KYC */}
          <div className="space-y-6">
            <div className="bg-[#1a2b3c] rounded-2xl p-6 text-white shadow-sm">
              <p className="text-xs text-gray-300 mb-2 font-medium">Available cashback balance</p>
              <div className="text-4xl font-bold mb-1">₹{balance.toFixed(2)}</div>
              <p className="text-[11px] text-gray-400 mb-6">Minimum withdrawal amount: ₹500</p>
              <button className="w-full bg-white text-[#1a2b3c] hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors text-sm">
                Complete KYC to withdraw
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">KYC & withdrawal</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">Verify your identity once to safely receive cashback in your bank account.</p>
              <button className="w-full bg-[#0a805c] hover:bg-[#086a4c] text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm">
                Complete KYC
              </button>
            </div>
          </div>
        </div>

        {/* Bottom - History */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-gray-900">Cashback history</h2>
            <button className="text-[#0a805c] text-sm font-semibold hover:underline">View all</button>
          </div>
          <p className="text-xs text-gray-500 mb-6">Your cashback claims and withdrawal requests appear here.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-[#f8f9fa] text-gray-400 text-xs">
                <tr>
                  <th className="px-4 py-3 font-normal w-1/4 rounded-l-lg">Date</th>
                  <th className="px-4 py-3 font-normal w-1/4">Details</th>
                  <th className="px-4 py-3 font-normal w-1/4">Amount</th>
                  <th className="px-4 py-3 font-normal w-1/4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 text-sm">
                      No cashback history yet. Claim cashback to begin.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-4">{item.date}</td>
                      <td className="px-4 py-4">{item.details}</td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{item.amount}</td>
                      <td className="px-4 py-4">
                        <span className="text-[#0a805c] font-medium">{item.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400">Cashback is subject to successful ad completion and KYC verification before withdrawal.</p>
          </div>
        </div>

      </div>
    </main>
  );
}