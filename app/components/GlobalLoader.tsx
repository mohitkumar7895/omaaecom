"use client";

import { useEffect, useState } from "react";

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

    // Smooth simulated progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 45);

    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem("omaa_company_app_loaded", "true");
        } catch (e) {}
      }, 600);
    }, 900);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animateOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Soft Ambient Radial Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#6b62d9]/15 via-[#a268b8]/10 to-transparent blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative flex flex-col items-center max-w-xs w-full px-6 z-10">
        
        {/* Seamless Logo - No borders, no boxes, no frames */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logoomaa.webp"
            alt="OMAA Company"
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm animate-[softPulse_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Brand Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-black tracking-tight text-gray-900">
            OMAA <span className="text-[#6b62d9]">Company</span>
          </h2>
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
            Doorstep Appliance Care
          </p>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="w-44 h-1 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#6b62d9] via-[#8554c4] to-[#db5285] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

      </div>

      <style jsx>{`
        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
