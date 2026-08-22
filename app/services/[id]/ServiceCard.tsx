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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-6 flex justify-between gap-4 sm:gap-6 mb-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Left side: details */}
      <div className="flex-1">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-1">{service.title}</h3>
        
        <div className="flex items-center space-x-1 text-[13px] text-gray-500 mb-3">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          <span className="font-bold text-black">{service.rating}</span>
          <span>({service.reviews ? `${service.reviews}` : '273K reviews'})</span>
        </div>

        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <span className="text-blue-600 font-bold text-lg sm:text-[22px]">₹{service.selling_price}</span>
          <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
            <span className="text-gray-300">•</span> {service.duration || '45 mins'}
          </span>
        </div>

        {/* Bullet Points */}
        {service.short_description && (
          <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            {service.short_description.split('|').map((point: string, i: number) => (
              <li key={i} className="flex items-start text-xs sm:text-[13px] font-bold text-gray-800">
                <div className="w-[5px] h-[5px] rounded-full bg-gray-800 mt-[6px] mr-2.5 flex-shrink-0"></div>
                <span className="leading-tight">{point.trim()}</span>
              </li>
            ))}
          </ul>
        )}

        <button 
          onClick={(e) => { e.preventDefault(); onViewDetails && onViewDetails(); }}
          className="text-[#6069c9] text-xs sm:text-sm font-semibold hover:underline"
        >
          View details →
        </button>
      </div>

      {/* Right side: image and Add button */}
      <div className="relative w-[145px] sm:w-[170px] flex-shrink-0 mt-1">
        <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
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
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-100 text-[#6069c9] text-sm sm:text-[15px] font-bold h-10 sm:h-11 w-[100px] sm:w-[110px] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-between px-2.5 z-10">
            <button 
              onClick={(e) => { e.preventDefault(); onRemove && onRemove(); }}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-md transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-gray-800 text-base">{quantity}</span>
            <button 
              onClick={(e) => { e.preventDefault(); onAdd(service); }}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-md transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.preventDefault(); onAdd(service); }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#6069c9] text-[15px] font-bold h-10 sm:h-11 w-[100px] sm:w-[110px] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition border border-gray-100 flex items-center justify-center z-10"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
