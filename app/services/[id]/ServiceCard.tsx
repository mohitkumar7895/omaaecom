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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex justify-between gap-6 mb-4 hover:shadow-md transition">
      {/* Left side: details */}
      <div className="flex-1">
        <h3 className="text-gray-900 font-bold text-lg mb-1">{service.title}</h3>
        
        <div className="flex items-center space-x-1 text-[13px] text-gray-500 mb-3">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          <span className="font-bold text-black">{service.rating}</span>
          <span>({service.reviews ? `${service.reviews}` : '273K reviews'})</span>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-blue-600 font-bold text-[22px]">₹{service.selling_price}</span>
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <span className="text-gray-300">•</span> {service.duration || '45 mins'}
          </span>
        </div>

        {/* Bullet Points */}
        {service.short_description && (
          <ul className="space-y-1.5 mb-4">
            {service.short_description.split('|').map((point: string, i: number) => (
              <li key={i} className="flex items-start text-[13px] text-gray-600">
                <span className="mr-2 text-gray-400 mt-[2px]">•</span>
                <span>{point.trim()}</span>
              </li>
            ))}
          </ul>
        )}

        <button 
          onClick={(e) => { e.preventDefault(); onViewDetails && onViewDetails(); }}
          className="text-[#6069c9] text-sm font-semibold hover:underline"
        >
          View details →
        </button>
      </div>

      {/* Right side: image and Add button */}
      <div className="relative w-[140px] flex-shrink-0 flex flex-col items-center">
        <div className="w-full h-[110px] bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
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
          <div className="absolute -bottom-4 bg-white border border-gray-200 text-[#6069c9] text-[15px] font-bold h-10 w-28 rounded-lg shadow-md flex items-center justify-between px-2">
            <button 
              onClick={(e) => { e.preventDefault(); onRemove && onRemove(); }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-gray-800">{quantity}</span>
            <button 
              onClick={(e) => { e.preventDefault(); onAdd(service); }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.preventDefault(); onAdd(service); }}
            className="absolute -bottom-4 bg-[#7780d6] text-white text-[15px] font-bold h-10 w-28 rounded-lg shadow-md hover:bg-[#6069c9] transition border border-white flex items-center justify-center"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
