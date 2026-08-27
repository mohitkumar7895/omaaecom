"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ListTree, 
  IndianRupee, 
  FileText, 
  Users, 
  ClipboardList, 
  CalendarCheck, 
  Tag, 
  Image as ImageIcon, 
  MessageSquare,
  LogOut,
  ChevronDown,
  CalendarDays,
  PlusSquare,
  PackagePlus,
  Shield,
  XCircle,
  CheckCircle2,
  MapPin,
  Settings,
  Menu,
  ChevronRight,
  PlaySquare,
  Mail
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [rateCardOpen, setRateCardOpen] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(true);

  const isActive = (href: string) => pathname === href;

  const getLinkClass = (href: string, isSubItem = false) => {
    const active = isActive(href);
    if (isSubItem) {
      return `group flex items-center space-x-3 px-10 py-2.5 text-[13px] font-medium transition-all duration-300 rounded-lg mx-3 mb-0.5 ${
        active 
          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.05)]" 
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      }`;
    }
    return `group flex items-center justify-between px-4 py-3 mx-3 mb-1 text-[14px] font-medium transition-all duration-300 rounded-xl ${
      active 
        ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/5 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] backdrop-blur-md" 
        : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
    }`;
  };

  const getIconClass = (href: string, isSubItem = false) => {
    const active = isActive(href);
    return `transition-colors duration-300 ${
      active ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-slate-500 group-hover:text-slate-300"
    }`;
  };

  const overviewItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, href: "/admin" },
  ];

  const operationsItems = [
    { name: "Warranties", icon: <ShieldCheck className="w-[18px] h-[18px]" />, href: "/admin/warranties" },
    { name: "Complaints", icon: <MessageSquare className="w-[18px] h-[18px]" />, href: "/admin/complaints" },
    { name: "Contacts", icon: <Mail className="w-[18px] h-[18px]" />, href: "/admin/contacts" },
  ];

  const partnerItems = [
    { name: "KYC Approvals", icon: <Users className="w-[18px] h-[18px]" />, href: "/admin/kyc" },
    { name: "Registrations", icon: <ClipboardList className="w-[18px] h-[18px]" />, href: "/admin/registration-records" },
  ];

  const marketingItems = [
    { name: "Banners", icon: <ImageIcon className="w-[18px] h-[18px]" />, href: "/admin/banners" },
    { name: "Cashback Ads", icon: <PlaySquare className="w-[18px] h-[18px]" />, href: "/admin/cashback-ads" },
  ];

  const settingsItems = [
    { name: "System Settings", icon: <Settings className="w-[18px] h-[18px]" />, href: "/admin/settings" },
    { name: "GST Settings", icon: <FileText className="w-[18px] h-[18px]" />, href: "/admin/gst-settings" },
    { name: "Privacy Policy", icon: <Shield className="w-[18px] h-[18px]" />, href: "/admin/privacy-policy" },
    { name: "Terms & Conditions", icon: <FileText className="w-[18px] h-[18px]" />, href: "/admin/terms-and-conditions" },
  ];

  return (
    <div className="w-[260px] bg-[#050B14] h-full flex flex-col text-slate-300 border-r border-white/5 overflow-y-auto custom-scrollbar shadow-2xl relative">
      {/* Brand Logo */}
      <div className="h-16 px-6 bg-[#050B14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-start sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-md shadow-sm">
            <img src="/logoomaa.webp" alt="OMAA Logo" className="h-7 w-auto object-contain" />
          </div>
          <span className="font-bold tracking-wide text-white text-[15px] uppercase">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 overflow-y-auto space-y-6">
        
        {/* 1. Overview */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overview</div>
          {overviewItems.map((item, index) => (
            <Link
              key={`overview-${index}`}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              <div className="flex items-center space-x-3">
                <span className={getIconClass(item.href)}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 2. Bookings & Operations */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bookings & Operations</div>
          
          {/* Booking Dropdown Section */}
          <div className="mb-1">
            <button 
              onClick={() => setBookingOpen(!bookingOpen)}
              className={`w-[calc(100%-24px)] mx-3 flex items-center justify-between px-4 py-3 text-[14px] font-medium transition-all duration-200 rounded-xl hover:bg-slate-800 text-slate-300`}
            >
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-[18px] h-[18px] text-slate-400" />
                <span>Bookings</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${bookingOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${bookingOpen ? 'max-h-96 mt-1' : 'max-h-0'}`}>
              <div className="space-y-0.5 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <Link href="/admin/booking" className={getLinkClass("/admin/booking", true)}>
                  <span>All Bookings</span>
                </Link>
                <Link href="/admin/booking/new-product" className={getLinkClass("/admin/booking/new-product", true)}>
                  <span>New Product</span>
                </Link>
                <Link href="/admin/booking/amc" className={getLinkClass("/admin/booking/amc", true)}>
                  <span>AMC</span>
                </Link>
                <Link href="/admin/booking/visit-booking" className={getLinkClass("/admin/booking/visit-booking", true)}>
                  <span>Visit Booking</span>
                </Link>
                <Link href="/admin/booking/completed-booking" className={getLinkClass("/admin/booking/completed-booking", true)}>
                  <span>Completed</span>
                </Link>
                <Link href="/admin/booking/reject-booking" className={getLinkClass("/admin/booking/reject-booking", true)}>
                  <span>Rejected</span>
                </Link>
              </div>
            </div>
          </div>
          
          {operationsItems.map((item, index) => (
            <Link
              key={`operations-${index}`}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              <div className="flex items-center space-x-3">
                <span className={getIconClass(item.href)}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 3. Catalog & Services */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catalog & Services</div>
          
          {/* Categories Dropdown Section */}
          <div className="mb-1">
            <button 
              onClick={() => setCategoryOpen(!categoryOpen)}
              className={`w-[calc(100%-24px)] mx-3 flex items-center justify-between px-4 py-3 text-[14px] font-medium transition-all duration-200 rounded-xl hover:bg-slate-800 text-slate-300`}
            >
              <div className="flex items-center space-x-3">
                <ListTree className="w-[18px] h-[18px] text-slate-400" />
                <span>Categories</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${categoryOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${categoryOpen ? 'max-h-48 mt-1' : 'max-h-0'}`}>
              <div className="space-y-0.5 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <Link href="/admin/categories" className={getLinkClass("/admin/categories", true)}>
                  <span>Category</span>
                </Link>
                <Link href="/admin/subcategories" className={getLinkClass("/admin/subcategories", true)}>
                  <span>Subcategories</span>
                </Link>
                <Link href="/admin/services" className={getLinkClass("/admin/services", true)}>
                  <span>Services</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Rate Card Dropdown Section */}
          <div className="mb-1">
            <button 
              onClick={() => setRateCardOpen(!rateCardOpen)}
              className={`w-[calc(100%-24px)] mx-3 flex items-center justify-between px-4 py-3 text-[14px] font-medium transition-all duration-200 rounded-xl hover:bg-slate-800 text-slate-300`}
            >
              <div className="flex items-center space-x-3">
                <IndianRupee className="w-[18px] h-[18px] text-slate-400" />
                <span>Rate Card</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${rateCardOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${rateCardOpen ? 'max-h-32 mt-1' : 'max-h-0'}`}>
              <div className="space-y-0.5 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <Link href="/admin/rate-headings" className={getLinkClass("/admin/rate-headings", true)}>
                  <span>Rate Heading</span>
                </Link>
                <Link href="/admin/rate-cards" className={getLinkClass("/admin/rate-cards", true)}>
                  <span>Rate Cards</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Partners & Vendors */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partners & Vendors</div>
          {partnerItems.map((item, index) => (
            <Link
              key={`partner-${index}`}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              <div className="flex items-center space-x-3">
                <span className={getIconClass(item.href)}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 5. Marketing & Promotions */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marketing & Ads</div>
          {marketingItems.map((item, index) => (
            <Link
              key={`marketing-${index}`}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              <div className="flex items-center space-x-3">
                <span className={getIconClass(item.href)}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 6. Settings & Legal */}
        <div>
          <div className="px-7 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Settings & Policies</div>
          {settingsItems.map((item, index) => (
            <Link
              key={`settings-${index}`}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              <div className="flex items-center space-x-3">
                <span className={getIconClass(item.href)}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Logout */}
      <div className="px-6 py-5 mt-auto border-t border-white/5 bg-[#050B14]/80 backdrop-blur-xl sticky bottom-0">
        <button 
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/admin/login";
          }}
          className="flex items-center space-x-3 w-full text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1e293b;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
