"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Search, Bell, UserCircle, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative">
        {/* Sleek Glass Header */}
        <header className="h-16 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-4 md:px-6 shrink-0 z-40 sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center flex-1">
            {/* Hamburger for Mobile */}
            <button 
              className="p-2 -ml-2 mr-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-md hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search bookings, users, or services..." 
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1 md:mx-2 hidden sm:block"></div>
            <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition">
              <UserCircle className="h-7 w-7 text-gray-600" />
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-700 leading-none">Admin</span>
                <span className="text-[11px] text-gray-500 mt-0.5">Administrator</span>
              </div>
            </button>
          </div>
        </header>
        
        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-3 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
