"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MobileBannerCarousel({ banners = [] }: { banners?: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use DB banners if available, fallback to static if empty
  const images = banners.length > 0 ? banners : ["/Hero1.webp", "/Hero 2.webp", "/Hero3.webp"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full md:hidden rounded-2xl overflow-hidden shadow-lg mb-3 md:mb-6 group">
      <div 
        className="flex transition-transform duration-500 ease-in-out aspect-[2/1] sm:aspect-[21/9]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="w-full flex-shrink-0 relative bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-fill"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md z-10 transition-all opacity-70 hover:opacity-100"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md z-10 transition-all opacity-70 hover:opacity-100"
        aria-label="Next banner"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === idx ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Go to banner ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
