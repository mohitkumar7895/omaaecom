"use client";

import Link from "next/link";
import { User as UserIcon, Wallet, CalendarDays, History, Clock, MapPin, Settings, Share2, Info, LogOut, Headset, X } from "lucide-react";

interface ProfileDropdownProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ user, onLogout, isOpen, onClose }: ProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[140] lg:hidden animate-in fade-in duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      
      {/* Container */}
      <div className="fixed inset-y-0 right-0 h-full w-[280px] sm:w-[320px] lg:absolute lg:top-full lg:right-0 lg:bottom-auto lg:h-auto lg:mt-3 lg:w-72 bg-white lg:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-l lg:border border-gray-100 overflow-hidden flex flex-col z-[150] lg:origin-top-right animate-in slide-in-from-right lg:slide-in-from-right-0 lg:fade-in lg:zoom-in-95 duration-200">
        
        {/* Mobile Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="lg:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 z-10 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-5 pt-14 lg:pt-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#e2e5fc] flex items-center justify-center text-[#6069c9]">
          <UserIcon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Logged in as</span>
          <span className="text-gray-900 font-bold text-sm truncate max-w-[160px]">
            {user?.email || user?.displayName || "User"}
          </span>
        </div>
      </div>

      {/* Links List */}
      <div className="py-2 flex flex-col max-h-[60vh] overflow-y-auto hidden-scrollbar">
        <DropdownItem href="/my-bookings" icon={<Clock className="w-4 h-4" />} label="My Bookings" />
        <DropdownItem href="/my-amc" icon={<CalendarDays className="w-4 h-4" />} label="My AMC Plans" />
        <DropdownItem href="/wallet" icon={<Wallet className="w-4 h-4" />} label="Wallet" />
        <DropdownItem href="/manage-address" icon={<MapPin className="w-4 h-4" />} label="Manage Address" />
        <DropdownItem href="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
        <DropdownItem href="/about" icon={<Info className="w-4 h-4" />} label="About" />
        <DropdownItem href="/contact" icon={<Headset className="w-4 h-4" />} label="Contact Us" />
        
        {/* Refer & Earn Banner Item */}
        <a href="https://www.omaacompany.in" target="_blank" rel="noopener noreferrer" className="mx-3 my-2 block">
          <div className="bg-gradient-to-r from-[#6069c9] to-[#8088db] rounded-xl p-4 text-white relative overflow-hidden group transition-transform hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4" />
              <span className="font-bold text-sm">Refer & Earn</span>
            </div>
            <p className="text-[11px] text-white/90 leading-tight mb-2">
              Refer & earn ₹100 to ₹32Cr. Get when your friend completes their first booking.
            </p>
            <span className="text-xs font-bold bg-white text-[#6069c9] px-2.5 py-1 rounded-md inline-block">
              Refer now
            </span>
          </div>
        </a>
      </div>

      {/* Logout */}
      <div className="p-4 lg:p-3 mt-auto lg:mt-0 border-t border-gray-50 bg-gray-50/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 lg:py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold lg:font-semibold text-[15px] lg:text-sm shadow-sm lg:shadow-none bg-white lg:bg-transparent border border-red-100 lg:border-transparent"
        >
          <LogOut className="w-5 h-5 lg:w-4 lg:h-4" />
          Logout
        </button>
      </div>
    </div>
    </>
  );
}

function DropdownItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#6069c9] transition-colors group"
    >
      <div className="text-gray-400 group-hover:text-[#6069c9] transition-colors">
        {icon}
      </div>
      <span className="text-[14px] font-semibold">{label}</span>
    </Link>
  );
}
