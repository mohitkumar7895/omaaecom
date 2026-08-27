"use client";

import { Star, Minus, Plus } from "lucide-react";

type ServiceCardProps = {
  service: any;
  quantity?: number;
  onAdd: (service: any) => void;
  onRemove?: () => void;
  onViewDetails?: () => void;
};

export default function ServiceCard({ service, quantity = 0, onAdd, onRemove, onViewDetails }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3 sm:p-6 mb-3 sm:mb-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 w-full">
      {/* 1. Top Section: Title & Rating together in one line */}
      <div className="mb-2.5 sm:mb-3 flex flex-wrap items-center gap-2 sm:gap-2.5">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg leading-tight">{service.title}</h3>
        
        <div className="flex items-center space-x-1 text-[12px] sm:text-[13px] text-gray-600 bg-amber-50/80 border border-amber-200/70 px-2 py-0.5 rounded-full shadow-2xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span className="font-bold text-gray-900">{service.rating}</span>
          <span className="text-gray-500">({service.reviews ? `${service.reviews}` : '273K reviews'})</span>
        </div>
      </div>

      {/* 2. Bottom Section: Price & Details on Left, Image & Button on Right (Starts Below Rating) */}
      <div className="flex justify-between gap-3 sm:gap-6 items-start">
        {/* Left details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2.5 sm:mb-3">
            <span className="text-blue-600 font-bold text-lg sm:text-[22px]">₹{Number(service.selling_price)}</span>
            <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
              <span className="text-gray-300">•</span> {service.duration || '45 mins'}
            </span>
          </div>

          {/* Bullet Points */}
          {service.short_description && (
            <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              {service.short_description.split('|').map((point: string, i: number) => (
                <li key={i} className="flex items-start text-xs sm:text-[13px] font-bold text-gray-800">
                  <div className="w-[5px] h-[5px] rounded-full bg-gray-800 mt-[6px] mr-2 flex-shrink-0"></div>
                  <span className="leading-tight">{point.trim()}</span>
                </li>
              ))}
            </ul>
          )}

          <button 
            onClick={(e) => { e.preventDefault(); onViewDetails && onViewDetails(); }}
            className="text-[#6069c9] text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
          >
            View details →
          </button>
        </div>

        {/* Right side: Image and Add button (Shifted nicely to the right) */}
        <div className="relative w-[116px] sm:w-[150px] flex-shrink-0 self-start pb-3.5 -mr-0.5 sm:mr-0">
          <div className="w-full aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
            {service.image_url ? (
              <img 
                src={service.image_url} 
                alt={service.title} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Image</div>
            )}
          </div>
          
          {quantity > 0 ? (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-[#6069c9] text-sm sm:text-[15px] font-bold h-8 sm:h-9.5 w-[88px] sm:w-[105px] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-between px-2 z-10">
              <button 
                onClick={(e) => { e.preventDefault(); onRemove && onRemove(); }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-50 rounded-md transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-gray-800 text-xs sm:text-sm font-bold">{quantity}</span>
              <button 
                onClick={(e) => { e.preventDefault(); onAdd(service); }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-50 rounded-md transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.preventDefault(); onAdd(service); }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-[#6069c9] text-[12px] sm:text-[14px] font-extrabold h-8 sm:h-9.5 w-[88px] sm:w-[105px] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-gray-50 transition border border-gray-200 flex items-center justify-center z-10 uppercase tracking-wide cursor-pointer"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
