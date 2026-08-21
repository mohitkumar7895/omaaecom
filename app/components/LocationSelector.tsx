"use client";

import { useState } from "react";
import { ChevronDown, MapPin, X, LocateFixed, Search, ChevronRight } from "lucide-react";

export default function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 bg-gray-100/80 px-4 py-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition mr-2"
      >
        <MapPin className="text-[#5c67b8] w-4 h-4" />
        <span className="text-[13px] font-semibold text-gray-700">Select Location</span>
        <ChevronDown className="text-[#5c67b8] w-4 h-4" />
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* Close Area */}
          <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
          
          {/* Modal Card */}
          <div className="relative z-10 bg-white rounded-[32px] shadow-2xl p-6 md:p-8 max-w-[500px] w-full animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 left-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>

            <div className="mt-14 space-y-6">
              
              {/* Use Current Location Button */}
              <button className="w-full bg-[#f8f6fb] hover:bg-[#f0ebf9] transition rounded-[20px] p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#6b62d9] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
                    <LocateFixed className="w-6 h-6 text-white stroke-[2]" />
                  </div>
                  <span className="font-bold text-gray-800 text-[17px]">Use current location</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8878e1] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Search Bar */}
              <div className="relative flex items-center border border-gray-200 rounded-[20px] bg-white p-2 shadow-sm focus-within:border-[#8878e1] focus-within:ring-2 focus-within:ring-[#8878e1]/20 transition-all">
                <div className="pl-3 pr-2 flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  placeholder="Search area, street or city..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-base"
                />
                <button className="bg-[#6b62d9] hover:bg-[#5b52c9] transition text-white font-bold py-3 px-8 rounded-2xl ml-2 shadow-sm">
                  Search
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
