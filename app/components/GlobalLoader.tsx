"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Don't show loader anywhere on admin routes
    if (pathname && pathname.startsWith("/admin")) {
      setShow(false);
      return;
    }

    // 2. Only show once per session when starting the main customer website
    const hasLoaded = sessionStorage.getItem("omaa_app_initial_loaded");
    if (hasLoaded) {
      setShow(false);
      return;
    }

    setShow(true);

    // Smooth simulated progress across 3 seconds (3000ms)
    // 30ms interval * 100 increments = 3000ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Total 3 seconds display, then smooth fade out
    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem("omaa_app_initial_loaded", "true");
        } catch (e) {}
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        animateOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full px-6">
        
        {/* Slightly larger, bold loader.jpg Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loader.jpg"
          alt="OMAA Company"
          className="h-44 sm:h-52 md:h-56 w-auto object-contain animate-smooth-pulse select-none"
        />

        {/* Smooth 3-Second Royal Blue Progress Bar underneath */}
        <div className="w-64 sm:w-80 h-2 bg-blue-50/80 rounded-full overflow-hidden mt-8 border border-blue-100/60 shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#3b82f6] rounded-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

      </div>

      <style jsx>{`
        @keyframes smoothPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.96;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }
        .animate-smooth-pulse {
          animation: smoothPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
