"use client";

import Link from "next/link";
import { 
  User as UserIcon, 
  WalletCards, 
  ShieldCheck, 
  CalendarCheck2, 
  MapPin, 
  Settings, 
  Building2, 
  LogOut, 
  Headset, 
  X,
  Gift
} from "lucide-react";

interface ProfileDropdownProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ user, onLogout, isOpen, onClose }: ProfileDropdownProps) {
  if (!isOpen) return null;

  const referralCode = user?.referral_code || user?.coupon_code || "OC133461";
  const referralUrl = `https://omaacompany.in/?ref=${referralCode}`;

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
      <div className="fixed inset-y-0 right-0 h-full w-[300px] sm:w-[340px] lg:absolute lg:top-full lg:right-0 lg:bottom-auto lg:h-auto lg:mt-3 lg:w-80 bg-white lg:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-l lg:border border-gray-100 overflow-hidden flex flex-col z-[150] lg:origin-top-right animate-in slide-in-from-right lg:slide-in-from-right-0 lg:fade-in lg:zoom-in-95 duration-200">
        
        {/* Mobile Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="lg:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 z-10 hover:bg-gray-200 transition-colors cursor-pointer"
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
          <DropdownItem href="/my-bookings" icon={<CalendarCheck2 className="w-4 h-4 text-indigo-600" />} label="My Bookings" />
          <DropdownItem href="/my-amc" icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />} label="My AMC Plans" />
          <DropdownItem href="/wallet" icon={<WalletCards className="w-4 h-4 text-amber-500" />} label="Wallet" />
          <DropdownItem href="/manage-address" icon={<MapPin className="w-4 h-4 text-rose-500" />} label="Manage Address" />
          <DropdownItem href="/settings" icon={<Settings className="w-4 h-4 text-slate-600" />} label="Settings" />
          <DropdownItem href="/about" icon={<Building2 className="w-4 h-4 text-blue-600" />} label="About" />
          <DropdownItem href="/contact" icon={<Headset className="w-4 h-4 text-purple-600" />} label="Contact Us" />
          
          {/* Refer & Earn Banner Item matching exact screenshot with dynamic referral URL */}
          <a 
            href={referralUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={onClose} 
            className="mx-3 my-2.5 block cursor-pointer group"
          >
            <div className="bg-[#f5f6ff] border border-[#e5e7ff] rounded-2xl p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#d7daff] flex items-center justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">
                  Refer & earn ₹100 to ₹32Cr
                </h4>
                <p className="text-gray-500 text-[11px] leading-snug mt-1 mb-3">
                  Get when your friend completes their first booking
                </p>
                <span className="inline-block bg-[#6e3ff3] group-hover:bg-[#5f2fed] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all">
                  Refer now
                </span>
              </div>
              <div className="shrink-0 p-1 text-[#b8a7fa] group-hover:scale-105 transition-transform">
                <Gift className="w-11 h-11 stroke-[1.4]" />
              </div>
            </div>
          </a>
        </div>

        {/* Logout */}
        <div className="p-4 lg:p-3 mt-auto lg:mt-0 border-t border-gray-50 bg-gray-50/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 lg:py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold lg:font-semibold text-[15px] lg:text-sm shadow-sm lg:shadow-none bg-white lg:bg-transparent border border-red-100 lg:border-transparent cursor-pointer"
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
      className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50/80 hover:text-[#6069c9] transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#f0effb] group-hover:scale-105 transition-all shrink-0">
        {icon}
      </div>
      <span className="text-[14px] font-semibold text-gray-800 group-hover:text-[#6069c9] transition-colors">{label}</span>
    </Link>
  );
}
