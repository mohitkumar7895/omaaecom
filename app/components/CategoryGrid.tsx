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

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || services.length <= 5) return;

    let animationId: number;
    let isHovered = false;

    const handleMouseEnter = () => isHovered = true;
    const handleMouseLeave = () => isHovered = false;

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleMouseEnter, { passive: true });
    container.addEventListener('touchend', handleMouseLeave);

    const scroll = () => {
      if (!isHovered && container) {
        // Increment scroll position
        container.scrollLeft += 1.5; 
        
        // If we have scrolled exactly half the total width (because we duplicated the array)
        // reset to 0 for a truly seamless infinite loop
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleMouseEnter);
      container.removeEventListener('touchend', handleMouseLeave);
    };
  }, [services.length]);

  if (!services || services.length === 0) return null;
  
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 relative group">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900 inline-block border-b-4 border-indigo-500 pb-2">
          {title}
        </h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 lg:gap-6 pb-8 pt-4 -mt-4 px-4 -mx-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {(services.length > 5 ? [...services, ...services] : services).map((service, index) => (
            <Link 
              href={`/services/${service.category_id}`}
              key={`${service.id}-${index}`} 
              className="flex-none w-[160px] md:w-[190px] lg:w-[210px] bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full group/card hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:scale-105 hover:shadow-xl hover:z-10"
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
  );
}
