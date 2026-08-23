"use client";

import Link from "next/link";
import { User as UserIcon, Wallet, CalendarDays, History, Banknote, Clock, MapPin, Settings, Share2, Info, LogOut } from "lucide-react";

interface ProfileDropdownProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
}

export default function ProfileDropdown({ user, onLogout, isOpen }: ProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col z-[150] origin-top-right animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
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
        
        {/* Refer & Earn Banner Item */}
        <Link href="/refer-earn" className="mx-3 my-2 block">
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
        </Link>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-gray-50 bg-gray-50/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
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
