"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [show, setShow] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if loader was already shown during this session
    const hasLoaded = sessionStorage.getItem("omaa_company_app_loaded");
    if (hasLoaded) {
      return;
    }

    setShow(true);

    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem("omaa_company_app_loaded", "true");
        } catch (e) {}
      }, 500);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        animateOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Simple, clean loader image with smooth gentle pulse */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loader.jpg"
          alt="Loading..."
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain animate-smooth-pulse select-none"
        />

        {/* Minimalist smooth spinning ring */}
        <div className="mt-4 w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin"></div>
      </div>

      <style jsx>{`
        @keyframes smoothPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
          }
        }
        .animate-smooth-pulse {
          animation: smoothPulse 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
