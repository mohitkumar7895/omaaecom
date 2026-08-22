"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export type ServiceItem = {
  id: number;
  category_id: number;
  title: string;
  rating: string;
  reviews: string;
  discount: string | null;
  image_url: string | null;
};

type CategoryGridProps = {
  title: string;
  services: ServiceItem[];
};

export default function CategoryGrid({ title, services }: CategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Remove JS scroll loop entirely in favor of pure CSS animation for 100% smooth hardware-accelerated sliding

  if (!services || services.length === 0) return null;
  
  // We duplicate the array to allow infinite scrolling in CSS
  const displayServices = services.length > 3 ? [...services, ...services] : services;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 relative group overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes smooth-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-smooth-slide {
          animation: smooth-slide ${services.length * 3}s linear infinite;
          width: max-content;
        }
        .animate-smooth-slide:hover, .animate-smooth-slide:active {
          animation-play-state: paused;
        }
      `}} />
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold text-gray-900 inline-block border-b-4 border-indigo-500 pb-2">
          {title}
        </h2>
      </div>
      
      <div className="overflow-hidden pb-4 pt-4 -mt-4 -mx-4 px-4">
        <div className={`flex gap-3 lg:gap-4 ${services.length > 3 ? 'animate-smooth-slide' : ''}`}>
          {displayServices.map((service, index) => (
            <Link 
              href={`/services/${service.category_id}`}
              key={`${service.id}-${index}`} 
              className="flex-none w-[140px] md:w-[170px] lg:w-[190px] snap-start bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full group/card hover:border-indigo-300 hover:shadow-md"
            >
              {/* Image Area */}
              <div className="relative h-36 bg-gray-100 w-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              {service.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                  {service.discount}
                </span>
              )}
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`text-3xl opacity-50 ${service.image_url ? 'hidden' : ''}`}>
                {title.includes("AC") ? "❄️" : 
                 title.includes("Refrigerator") ? "🧊" : 
                 title.includes("Washing") ? "👕" : 
                 title.includes("Microwave") ? "♨️" : 
                 title.includes("Water") ? "💧" : "🔧"}
              </div>
            </div>
            
            {/* Text Area */}
            <div className="p-4 flex flex-col flex-1 justify-between">
              <h3 className="font-semibold text-sm text-gray-800 mb-2 leading-snug line-clamp-2">
                {service.title}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium mt-auto">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-gray-700">{service.rating}</span>
                <span>({service.reviews})</span>
              </div>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}
