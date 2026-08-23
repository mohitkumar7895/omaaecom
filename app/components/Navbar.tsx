"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin, ShoppingCart, User, Menu, X } from "lucide-react";
import LocationSelector from "./LocationSelector";
import LiveSearchBar from "./LiveSearchBar";
import LoginModal from "./LoginModal";
import { useEffect, useState, useRef } from "react";
import { getActiveCategories } from "../actions/categories";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem("omaa_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Calculate total items including quantities
        const totalItems = parsed.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(console.error);
    
    // Initial cart load
    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener("cart_updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user) {
            setIsLoginModalOpen(false);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("auth_changed", checkAuth);

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("cart_updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("auth_changed", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="relative z-[100] bg-white shadow-sm border-b border-gray-100 font-sans w-full">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-2 lg:py-3 relative flex items-center justify-between">
        
        {/* Left section: Logo & Nav Links */}
        <div className="flex items-center z-10 space-x-6 lg:space-x-10">
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

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
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
        </div>

        {/* Right section: Location & Icons */}
        <div className="flex items-center gap-2 lg:gap-4 z-10 flex-1 justify-end">
          {/* Desktop Search Bar */}
          <div className="hidden lg:block w-[180px] xl:w-[280px] order-1">
            <LiveSearchBar />
          </div>

          {/* Location Button (Client Component Modal) */}
          <div className="order-2">
            <LocationSelector />
          </div>

          {/* User Button & Dropdown */}
          <div className="relative order-4 lg:order-3" ref={profileRef}>
            <button 
              onClick={() => {
                if (user) {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className={`p-1.5 lg:p-2.5 rounded-[8px] lg:rounded-[10px] transition shadow-sm flex items-center justify-center ${
                user ? 'bg-[#5c67b8] text-white hover:bg-[#4a55a2]' : 'bg-[#6069c9] text-white hover:bg-[#525ab5]'
              }`}
            >
              <User className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.5]" />
            </button>
            <ProfileDropdown 
              user={user} 
              isOpen={isProfileDropdownOpen} 
              onLogout={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.dispatchEvent(new Event("auth_changed"));
                setIsProfileDropdownOpen(false);
              }} 
            />
          </div>
          
          {/* Cart Button */}
          <Link href="/cart" className="order-3 lg:order-4">
            <button className="relative bg-[#6069c9] p-1.5 lg:p-2.5 rounded-[8px] lg:rounded-[10px] text-white hover:bg-[#525ab5] transition shadow-sm flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.5]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 lg:w-[18px] lg:h-[18px] flex items-center justify-center rounded-full shadow-sm">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </Link>

          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
