"use client";

import { useRef } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export type ServiceItem = {
  id: number;
  category_id: number;
  title: string;
  rating: string;
  reviews?: string;
  discount?: string | null;
  selling_price?: number;
  original_price?: number;
  image_url?: string | null;
};

type CategoryGridProps = {
  title: string;
  services: ServiceItem[];
};

export default function CategoryGrid({ title, services }: CategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!services || services.length === 0) return null;
  
  // We duplicate the array to allow infinite scrolling in CSS if items > 3
  const displayServices = services.length > 3 ? [...services, ...services] : services;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 relative group overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes smooth-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-smooth-slide {
          animation: smooth-slide ${services.length * 3.5}s linear infinite;
          width: max-content;
        }
        .animate-smooth-slide:hover, .animate-smooth-slide:active {
          animation-play-state: paused;
        }
      `}} />
      
      <div className="flex justify-between items-end mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight inline-block border-b-4 border-[#6b62d9] pb-2">
          {title}
        </h2>
      </div>
      
      <div className="overflow-hidden pb-4 pt-2 -mt-2 -mx-4 px-4">
        <div className={`flex gap-3.5 sm:gap-4 md:gap-5 ${services.length > 3 ? 'animate-smooth-slide' : ''}`}>
          {displayServices.map((service, index) => (
            <Link 
              href={`/services/${service.category_id}`}
              key={`${service.id}-${index}`} 
              className="flex-none w-[155px] sm:w-[185px] md:w-[210px] lg:w-[225px] snap-start bg-white rounded-2xl border border-gray-200/80 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full group/card hover:border-[#6b62d9]/50 hover:shadow-lg"
            >
              {/* Image Area - Vertically taller, proper aspect ratio, no top cropping */}
              <div className="relative h-44 sm:h-48 md:h-52 bg-[#f8f9fb] w-full flex-shrink-0 flex items-center justify-center overflow-hidden p-3">
                {service.discount && (
                  <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 shadow-sm">
                    {service.discount}
                  </span>
                )}
                {service.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="w-full h-full object-contain drop-shadow-sm group-hover/card:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-4xl opacity-60 ${service.image_url ? 'hidden' : ''}`}>
                  {title.includes("AC") ? "❄️" : 
                   title.includes("Refrigerator") ? "🧊" : 
                   title.includes("Washing") ? "👕" : 
                   title.includes("Microwave") ? "♨️" : 
                   title.includes("Water") || title.includes("RO") ? "💧" : "🔧"}
                </div>
              </div>
              
              {/* Text Area */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 leading-snug line-clamp-2 group-hover/card:text-[#6b62d9] transition-colors">
                  {service.title}
                </h3>
                
                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span className="text-gray-800 font-bold">{service.rating || "4.8"}</span>
                    {service.reviews && <span className="text-gray-400 text-[11px]">({service.reviews})</span>}
                  </div>
                  
                  {service.selling_price && (
                    <span className="text-xs sm:text-sm font-black text-[#6b62d9]">
                      ₹{service.selling_price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
