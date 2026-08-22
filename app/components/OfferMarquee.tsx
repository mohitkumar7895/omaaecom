"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function OfferMarquee({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!text || !isVisible) return null;

  return (
    <div className="relative w-full z-[100] overflow-hidden shadow-md group">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 animate-gradient-x bg-[length:200%_200%]"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="max-w-7xl mx-auto flex items-center justify-center py-1 sm:py-2 px-4 sm:px-10 relative h-[36px] sm:h-[46px]">
        
        {/* Animated Marquee Text Container */}
        <div className="w-full overflow-hidden flex items-center justify-center relative mask-edges">
          <div className="animate-marquee whitespace-nowrap flex items-center group-hover:[animation-play-state:paused] cursor-default">
            
            {/* Repeated Text blocks for infinite scroll illusion */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center ml-6 sm:ml-12 drop-shadow-md">
                {/* Sale Badge */}
                <span className="bg-yellow-400 text-red-700 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)] mr-2 sm:mr-4">
                  Mega Offer
                </span>
                
                {/* 3D Emoji / Image */}
                <span className="text-base sm:text-xl mr-2 sm:mr-3 -mt-0.5 filter drop-shadow">🎁</span>
                
                {/* Offer Text */}
                <span className="font-extrabold text-[11px] sm:text-[14px] tracking-wide sm:tracking-[0.1em] uppercase text-white mt-[1px]">
                  {text}
                </span>
              </div>
            ))}

          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all z-10 backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
}
