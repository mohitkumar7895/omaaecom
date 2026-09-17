"use client";

import { Eye, X } from "lucide-react";
import { useState } from "react";

export default function ZonesModalButton({ 
  categoryId, 
  zonesLocation, 
  zonesCount 
}: { 
  categoryId: number, 
  zonesLocation: string, 
  zonesCount: number 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#0dcaf0] hover:bg-[#0bacce] text-white p-1.5 rounded transition shadow-sm mx-auto flex"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#2c3e50] px-5 py-3 text-white">
              <h3 className="font-semibold text-[15px]">Category Zones</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Zones</h4>
                  <p className="text-gray-900 text-sm font-medium">{zonesCount || 1}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Locations</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {zonesLocation ? zonesLocation.split(',').map((loc, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {loc.trim()}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-xs">No zones configured</span>
                    )}
                  </div>
                </div>

                <div className="w-full h-64 border border-gray-200 rounded-xl overflow-hidden mt-4 shadow-inner">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      zonesLocation ? `${zonesLocation.split(',')[0].trim()}, India` : 'Noida, Delhi, India'
                    )}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                    width="100%" 
                    height="100%" 
                    className="filter invert-[90%] hue-rotate-[180deg] contrast-[90%] brightness-[95%] grayscale-[10%]"
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    title="Category Zone Map"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded text-sm font-medium transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
