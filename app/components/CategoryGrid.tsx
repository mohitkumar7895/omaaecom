"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import CategoryReviewsModal from "./CategoryReviewsModal";

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
  const [selectedReviewCategory, setSelectedReviewCategory] = useState<string | null>(null);

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
      
      <div className="overflow-hidden pb-4 pt-1.5 -mt-1.5 -mx-4 px-4">
        <div className={`flex gap-3.5 sm:gap-4 md:gap-5 items-stretch ${services.length > 3 ? 'animate-smooth-slide' : ''}`}>
          {displayServices.map((service, index) => (
            <Link 
              href={`/services/${service.category_id}`}
              key={`${service.id}-${index}`} 
              className="flex-none w-[180px] sm:w-[215px] md:w-[245px] snap-start bg-white rounded-2xl border border-gray-200/80 shadow-xs transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group/card hover:border-[#6b62d9]/50 hover:shadow-lg"
            >
              {/* Image Area - Prominent and Spacious */}
              <div className="relative h-42 sm:h-48 md:h-52 bg-[#f8f9fb] w-full shrink-0 flex items-center justify-center overflow-hidden p-3">
                {service.discount && (
                  <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 shadow-xs">
                    {service.discount}
                  </span>
                )}
                {service.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="w-full h-full object-contain drop-shadow-xs group-hover/card:scale-105 transition-transform duration-300"
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
                <h3 className="font-bold text-xs sm:text-[14px] text-gray-900 leading-snug line-clamp-2 group-hover/card:text-[#6b62d9] transition-colors">
                  {service.title}
                </h3>
                
                {/* Rating & Review clickable button */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedReviewCategory(service.title || title);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-amber-50/80 hover:bg-amber-100/90 text-gray-800 px-2 py-1 rounded-lg border border-amber-200/70 transition-all cursor-pointer group/btn"
                    title="Click to view ratings and customer reviews"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span className="font-bold text-gray-900">{service.rating || "4.8"}</span>
                    <span className="text-[11px] text-indigo-700 font-bold group-hover/btn:underline flex items-center gap-0.5">
                      Reviews
                    </span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Category Reviews Modal */}
      {selectedReviewCategory && (
        <CategoryReviewsModal 
          categoryTitle={selectedReviewCategory}
          isOpen={!!selectedReviewCategory}
          onClose={() => setSelectedReviewCategory(null)}
        />
      )}
    </div>
  );
}
