"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [show, setShow] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if loader was already shown in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("omaa_loader_shown")) {
      setShow(false);
      return;
    }

    // Simulate a fast loading progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 15;
      });
    }, 50);

    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("omaa_loader_shown", "true");
      }, 800); 
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        animateOut ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm w-full px-8">
        
        {/* Cinematic Logo Reveal */}
        <div className={`relative w-28 h-28 md:w-36 md:h-36 mb-10 transition-all duration-1000 ease-out ${animateOut ? 'scale-90 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'}`}>
          {/* Subtle Glow Behind Logo */}
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[30px] animate-pulse"></div>
          
          <div className="relative w-full h-full bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-4 flex items-center justify-center overflow-hidden">
            <img 
              src="/logoomaa.webp" 
              alt="OMAA Logo" 
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className={`w-full flex flex-col gap-3 transition-all duration-700 delay-100 ${animateOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
