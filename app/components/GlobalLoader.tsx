"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [show, setShow] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth simulated progress across 5 seconds (5000ms)
    // 50ms interval * 100 increments = 5000ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    // Total 5 seconds display, then fade out
    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
      }, 600);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-600 ease-out ${
        animateOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-xs w-full px-6">
        
        {/* Simple loader.jpg Image with subtle gentle breathing animation */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loader.jpg"
          alt="OMAA Company"
          className="h-24 sm:h-28 w-auto object-contain animate-smooth-pulse select-none"
        />

        {/* Smooth 5-Second Linear Progress Bar underneath */}
        <div className="w-52 sm:w-60 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-6 shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-[#ff8000] via-[#6366f1] to-[#10b981] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

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
          animation: smoothPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
