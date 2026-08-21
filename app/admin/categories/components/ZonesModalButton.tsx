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
                    {(zonesLocation || 'Noida, Delhi').split(',').map((loc, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {loc.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[200px] border border-gray-200 rounded overflow-hidden mt-4">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112030.702434524!2d77.10657999806461!3d28.660142839958172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1708890000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
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
