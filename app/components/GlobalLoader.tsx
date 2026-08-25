"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function GlobalLoader() {
  const [show, setShow] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if loader was already shown during this browser session
    const hasLoaded = sessionStorage.getItem("omaa_company_app_loaded");
    if (hasLoaded) {
      return;
    }

    // Initial startup: show loader
    setShow(true);

    // Ultra smooth simulated progress over ~2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Smooth easing acceleration towards 100
        const increment = prev < 50 ? 5 : prev < 85 ? 3 : 2;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem("omaa_company_app_loaded", "true");
        } catch (e) {}
      }, 700);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animateOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Animated Ambient Glow Spheres in Background */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#6366f1]/30 via-[#a855f7]/25 to-[#ec4899]/20 blur-[100px] pointer-events-none animate-spin-slow"></div>
      <div className="absolute w-72 h-72 rounded-full bg-[#3b82f6]/20 blur-[80px] pointer-events-none -top-10 -left-10 animate-pulse"></div>

      <div className="relative flex flex-col items-center max-w-sm w-full px-6 z-10">
        
        {/* Modern Vector Dynamic Brand Icon with Orbiting Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          
          {/* Glowing Ring Animation */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] opacity-75 blur-lg animate-pulse"></div>
          
          {/* Outer Rotating Subtle Dashed Border */}
          <div className="absolute -inset-2.5 rounded-2xl border border-white/20 animate-spin-slow pointer-events-none"></div>

          {/* Central Premium Emblem */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl group overflow-hidden">
            
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none"></div>
            
            {/* Brand Lettermark O with Sparkle */}
            <div className="relative flex items-center justify-center">
              <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-white via-indigo-200 to-pink-200 drop-shadow-md">
                O
              </span>
              <Sparkles className="w-4 h-4 text-pink-400 absolute -top-1 -right-2 animate-bounce" />
            </div>

          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Experts
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            OMAA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">COMPANY</span>
          </h2>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-1">
            Doorstep Appliance Care
          </p>
        </div>

        {/* Ultra Smooth Modern Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative shadow-[0_0_12px_rgba(168,85,247,0.75)]"
            style={{ width: `${progress}%` }}
          >
            {/* Progress Tip Sparkle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff]"></div>
          </div>
        </div>

        {/* Percentage or Loading Status */}
        <div className="mt-2.5 flex items-center justify-between w-48 text-[10px] font-bold text-slate-400">
          <span className="tracking-widest uppercase text-slate-400/80">Loading experience</span>
          <span className="font-mono text-indigo-300">{progress}%</span>
        </div>

      </div>

      <style jsx>{`
        @keyframes spinSlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2.2s infinite;
        }
      `}</style>
    </div>
  );
}
