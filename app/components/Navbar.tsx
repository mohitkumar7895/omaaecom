"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin, ShoppingCart, User, Menu, X } from "lucide-react";
import LocationSelector from "./LocationSelector";
import { useEffect, useState } from "react";
import { getActiveCategories } from "../actions/categories";

export default function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <nav className="relative z-[100] bg-white shadow-sm border-b border-gray-100 font-sans w-full">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-2 lg:py-3 relative flex items-center justify-between">
        
        {/* Left section: Logo */}
        <div className="flex items-center z-10">
          <Link href="/">
            {/* Use the exact logo from the public folder */}
            <Image 
              src="/logoomaa.webp" 
              alt="OMAA Logo" 
              width={160} 
              height={50} 
              className="h-7 lg:h-12 w-auto object-contain cursor-pointer"
              priority
            />
          </Link>
        </div>

        {/* Middle section: Navigation Links (Absolutely Centered) */}
        <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2 z-10">
          <Link href="/" className="font-semibold text-gray-900 hover:text-[#5c67b8] transition text-[15px]">
            Home
          </Link>
          <Link href="/about" className="font-semibold text-gray-700 hover:text-[#5c67b8] transition text-[15px]">
            About Us
          </Link>
          <div className="relative group">
            <div className="flex items-center space-x-1 cursor-pointer font-semibold text-gray-700 hover:text-[#5c67b8] transition text-[15px] py-4">
              <span>Services</span>
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-200" />
            </div>
            <div className="absolute top-[80%] left-0 w-56 bg-white shadow-xl rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
              {categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <Link key={cat.id} href={`/services/${cat.id}`} className={`block px-4 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c67b8] ${idx !== categories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {cat.title}
                  </Link>
                ))
              ) : (
                <div className="block px-4 py-3 text-[14px] text-gray-500">No services</div>
              )}
            </div>
          </div>
          <Link href="/contact" className="font-semibold text-gray-700 hover:text-[#5c67b8] transition text-[15px]">
            Contact Us
          </Link>
        </div>

        {/* Right section: Location & Icons */}
        <div className="flex items-center space-x-2 lg:space-x-3 z-10">
          {/* Location Button (Client Component Modal) */}
          <LocationSelector />

          {/* User Button */}
          <Link href="/login">
            <button className="bg-[#6069c9] p-1.5 lg:p-2.5 rounded-[8px] lg:rounded-[10px] text-white hover:bg-[#525ab5] transition shadow-sm flex items-center justify-center">
              <User className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.5]" />
            </button>
          </Link>
          
          {/* Cart Button */}
          <Link href="/cart">
            <button className="bg-[#6069c9] p-1.5 lg:p-2.5 rounded-[8px] lg:rounded-[10px] text-white hover:bg-[#525ab5] transition shadow-sm flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.5]" />
            </button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="lg:hidden p-1.5 ml-1 text-gray-700 hover:text-[#5c67b8] transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 flex flex-col z-[90]">
          <Link href="/" className="px-6 py-4 border-b border-gray-50 font-semibold text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/about" className="px-6 py-4 border-b border-gray-50 font-semibold text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
            About Us
          </Link>
          <div className="flex flex-col border-b border-gray-50">
            <div 
              className="px-6 py-4 flex justify-between items-center font-semibold text-gray-800 cursor-pointer"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              <span>Services</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isMobileServicesOpen ? 'rotate-180 text-[#5c67b8]' : 'text-gray-500'}`} />
            </div>
            {isMobileServicesOpen && (
              <div className="bg-gray-50 flex flex-col">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link key={cat.id} href={`/services/${cat.id}`} className="px-10 py-3 text-[14px] text-gray-600 border-b border-gray-100 last:border-0 hover:text-[#5c67b8]" onClick={() => setIsMobileMenuOpen(false)}>
                      {cat.title}
                    </Link>
                  ))
                ) : (
                  <div className="px-10 py-3 text-[14px] text-gray-500">No services</div>
                )}
              </div>
            )}
          </div>
          <Link href="/contact" className="px-6 py-4 font-semibold text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}
