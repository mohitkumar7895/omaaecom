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
  Menu
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
      return `flex items-center space-x-3 px-10 py-2.5 text-[13px] transition ${
        active 
          ? "bg-white/10 border-l-4 border-blue-500 text-white" 
          : "text-gray-400 hover:text-white hover:bg-gray-700/30 border-l-4 border-transparent"
      }`;
    }
    return `flex items-center justify-between px-6 py-3 text-sm transition-colors hover:bg-gray-700/50 hover:text-white ${
      active 
        ? "bg-white/10 border-l-4 border-blue-500 text-white" 
        : "border-l-4 border-transparent"
    }`;
  };

  const topItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/admin", active: false },
    { name: "Warranties", icon: <ShieldCheck className="w-4 h-4" />, href: "/admin/warranties" },
  ];

  const middleItems = [
    { name: "GST Settings", icon: <FileText className="w-4 h-4" />, href: "/admin/gst-settings" },
    { name: "KYC", icon: <Users className="w-4 h-4" />, href: "/admin/kyc" },
    { name: "Registration Records", icon: <ClipboardList className="w-4 h-4" />, href: "/admin/registration-records" },
  ];

  const bottomItems = [
    { name: "Brands", icon: <Tag className="w-4 h-4" />, href: "/admin/brands" },
    { name: "Banners", icon: <ImageIcon className="w-4 h-4" />, href: "/admin/banners" },
    { name: "Complaints", icon: <MessageSquare className="w-4 h-4" />, href: "/admin/complaints" },
  ];

  return (
    <div className="w-64 bg-[#2f3d51] min-h-screen flex flex-col text-gray-300 pb-10 shadow-xl overflow-y-auto">
      {/* Brand Logo */}
      <div className="p-6 bg-[#253244] border-b border-gray-700/50 flex flex-col items-center">
        <div className="bg-white p-2 rounded shadow-sm w-3/4">
          <img src="/logoomaa.webp" alt="OMAA Logo" className="w-full object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 mt-4 overflow-y-auto space-y-0.5">
        
        {/* Top Items */}
        {topItems.map((item, index) => (
          <Link
            key={`top-${index}`}
            href={item.href}
            className={getLinkClass(item.href)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
          </Link>
        ))}

        {/* Categories Dropdown Section */}
        <div>
          <button 
            onClick={() => setCategoryOpen(!categoryOpen)}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors hover:bg-gray-700/50 hover:text-white border-l-4 border-transparent`}
          >
            <div className="flex items-center space-x-3">
              <ListTree className="w-4 h-4" />
              <span className="font-medium">Categories</span>
            </div>
            <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {categoryOpen && (
            <div className="bg-[#253244] py-1 border-y border-gray-700/50">
              <Link href="/admin/categories" className={getLinkClass("/admin/categories", true)}>
                <ListTree className="w-3.5 h-3.5 opacity-70" />
                <span>Category</span>
              </Link>
              <Link href="/admin/subcategories" className={getLinkClass("/admin/subcategories", true)}>
                <Menu className="w-3.5 h-3.5 opacity-70" />
                <span>Subcategories</span>
              </Link>
              <Link href="/admin/services" className={getLinkClass("/admin/services", true)}>
                <Settings className="w-3.5 h-3.5 opacity-70" />
                <span>Services</span>
              </Link>
            </div>
          )}
        </div>

        {/* Rate Card Dropdown Section */}
        <div>
          <button 
            onClick={() => setRateCardOpen(!rateCardOpen)}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors hover:bg-gray-700/50 hover:text-white border-l-4 border-transparent`}
          >
            <div className="flex items-center space-x-3">
              <IndianRupee className="w-4 h-4" />
              <span className="font-medium">Rate Card</span>
            </div>
            <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${rateCardOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {rateCardOpen && (
            <div className="bg-[#253244] py-1 border-y border-gray-700/50">
              <Link href="/admin/rate-headings" className={getLinkClass("/admin/rate-headings", true)}>
                <IndianRupee className="w-3.5 h-3.5 opacity-70" />
                <span>Rate Heading</span>
              </Link>
              <Link href="/admin/rate-cards" className={getLinkClass("/admin/rate-cards", true)}>
                <IndianRupee className="w-3.5 h-3.5 opacity-70" />
                <span>Rate Cards</span>
              </Link>
            </div>
          )}
        </div>

        {/* Middle Items */}
        {middleItems.map((item, index) => (
          <Link
            key={`mid-${index}`}
            href={item.href}
            className={getLinkClass(item.href)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
            {(item as any).hasSub && <ChevronDown className="w-4 h-4 opacity-50" />}
          </Link>
        ))}

        {/* Booking Dropdown Section */}
        <div>
          <button 
            onClick={() => setBookingOpen(!bookingOpen)}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors hover:bg-gray-700/50 hover:text-white border-l-4 border-transparent`}
          >
            <div className="flex items-center space-x-3">
              <CalendarCheck className="w-4 h-4" />
              <span className="font-medium">Booking</span>
            </div>
            <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${bookingOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {bookingOpen && (
            <div className="bg-[#253244] py-1 border-y border-gray-700/50">
              <Link href="/admin/booking" className={getLinkClass("/admin/booking", true)}>
                <CalendarDays className="w-3.5 h-3.5 opacity-70" />
                <span>Booking</span>
              </Link>
              <Link href="/admin/booking/new-booking" className={getLinkClass("/admin/booking/new-booking", true)}>
                <PlusSquare className="w-3.5 h-3.5 opacity-70" />
                <span>New Booking</span>
              </Link>
              <Link href="/admin/booking/new-product" className={getLinkClass("/admin/booking/new-product", true)}>
                <PackagePlus className="w-3.5 h-3.5 opacity-70" />
                <span>New Product</span>
              </Link>
              <Link href="/admin/booking/amc" className={getLinkClass("/admin/booking/amc", true)}>
                <Shield className="w-3.5 h-3.5 opacity-70" />
                <span>AMC</span>
              </Link>
              <Link href="/admin/booking/reject-booking" className={getLinkClass("/admin/booking/reject-booking", true)}>
                <XCircle className="w-3.5 h-3.5 opacity-70" />
                <span>Reject Booking</span>
              </Link>
              <Link href="/admin/booking/completed-booking" className={getLinkClass("/admin/booking/completed-booking", true)}>
                <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
                <span>Completed Booking</span>
              </Link>
              <Link href="/admin/booking/visit-booking" className={getLinkClass("/admin/booking/visit-booking", true)}>
                <MapPin className="w-3.5 h-3.5 opacity-70" />
                <span>Visit Booking</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Items */}
        {bottomItems.map((item, index) => (
          <Link
            key={`bottom-${index}`}
            href={item.href}
            className={getLinkClass(item.href)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 py-4 mt-auto border-t border-gray-700/50">
        <button className="flex items-center space-x-3 text-sm text-gray-400 hover:text-white transition">
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
