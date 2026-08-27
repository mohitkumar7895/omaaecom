"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;

  // Start with true for customer pages so SSR and first paint immediately display the loader
  const [show, setShow] = useState<boolean>(!isAdmin);
  const [animateOut, setAnimateOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Don't show loader on admin routes
    if (isAdmin) {
      setShow(false);
      return;
    }

    // 2. Only show once per session when starting the main customer website
    try {
      const hasLoaded = sessionStorage.getItem("omaa_app_initial_loaded");
      if (hasLoaded) {
        setShow(false);
        return;
      }
    } catch (e) {}

    // Smooth simulated progress across 2.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    // Total duration before fade out
    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem("omaa_app_initial_loaded", "true");
        } catch (e) {}
      }, 500);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (!show || isAdmin) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('omaa_app_initial_loaded')==='true'){var el=document.getElementById('omaa-global-loader');if(el){el.style.display='none';}}}catch(e){}`,
        }}
      />
      <div
        id="omaa-global-loader"
        className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
          animateOut ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-md w-full px-6">
          
          {/* Prominent Loader Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loader.jpg"
            alt="OMAA Company"
            className="h-52 sm:h-60 md:h-64 w-auto object-contain animate-smooth-pulse select-none"
          />

          {/* Running Blue Line directly close underneath the image */}
          <div className="w-72 sm:w-88 md:w-96 h-2 bg-blue-50/80 rounded-full overflow-hidden mt-3 border border-blue-100/60 shadow-inner relative">
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
    </>
  );
}
