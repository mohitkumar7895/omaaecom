import { List, AlignJustify, Settings, IndianRupee, Contact, CalendarCheck, Image as ImageIcon } from "lucide-react";
import pool from "../../lib/db";
import Link from "next/link";

// Force Next.js to fetch data dynamically on every request
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let adminCount = 0;
  let categoryCount = 0;
  let serviceCount = 0;
  let bannerCount = 0;
  let brandCount = 0;

  try {
    const [adminsResult, categoriesResult, servicesResult, bannersResult, brandsResult] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM admins"),
      pool.query("SELECT COUNT(*) as count FROM categories"),
      pool.query("SELECT COUNT(*) as count FROM services"),
      pool.query("SELECT COUNT(*) as count FROM banners"),
      pool.query("SELECT COUNT(*) as count FROM brands")
    ]);
    
    adminCount = (adminsResult[0] as any)[0].count;
    categoryCount = (categoriesResult[0] as any)[0].count;
    serviceCount = (servicesResult[0] as any)[0].count;
    bannerCount = (bannersResult[0] as any)[0].count;
    brandCount = (brandsResult[0] as any)[0].count;
  } catch (error) {
    console.error("Database connection failed or tables missing:", error);
  }
  
  const statsRow1 = [
    { label: "Total Categories", value: categoryCount.toString(), color: "text-gray-800", href: "/admin/categories" },
    { label: "Total Services", value: serviceCount.toString(), color: "text-green-500", href: "/admin/services" },
    { label: "Total Brands", value: brandCount.toString(), color: "text-yellow-500", href: "/admin/brands" },
    { label: "Total Banners", value: bannerCount.toString(), color: "text-blue-500", href: "/admin/banners" },
    { label: "Total Admins", value: adminCount.toString(), color: "text-cyan-500", href: "/admin/register" },
    { label: "Pending Bookings", value: "0", color: "text-red-500", href: "/admin/booking" },
  ];

  const statsRow2 = [
    { label: "Active Services", value: serviceCount.toString(), color: "text-cyan-500", href: "/admin/services" },
    { label: "New Products", value: "0", color: "text-gray-800", href: "/admin/booking/new-product" },
  ];

  const quickLinks = [
    { name: "Categories", icon: <List className="w-8 h-8 text-[#51a6f5] mb-4 stroke-[1.5]" />, href: "/admin/categories" },
    { name: "Subcategories", icon: <AlignJustify className="w-8 h-8 text-[#51a6f5] mb-4 stroke-[1.5]" />, href: "/admin/subcategories" },
    { name: "Services", icon: <Settings className="w-8 h-8 text-[#4caf50] mb-4 stroke-[1.5]" />, href: "/admin/services" },
    { name: "Rate Cards", icon: <IndianRupee className="w-8 h-8 text-[#ff9800] mb-4 stroke-[1.5]" />, href: "/admin/rate-cards" },
    { name: "KYC", icon: <Contact className="w-8 h-8 text-[#f44336] mb-4 stroke-[1.5]" />, href: "/admin/kyc" },
    { name: "Booking", icon: <CalendarCheck className="w-8 h-8 text-[#03a9f4] mb-4 stroke-[1.5]" />, href: "/admin/booking" },
    { name: "Banners", icon: <ImageIcon className="w-8 h-8 text-[#212121] mb-4 stroke-[1.5]" />, href: "/admin/banners" },
  ];

  return (
    <div className="p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-800 tracking-tight">Welcome, admin!</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your OMAA system from here. Live Database Stats.</p>
      </div>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {statsRow1.map((stat, index) => (
          <Link href={stat.href} key={index}>
            <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[88px] cursor-pointer hover:shadow-md transition">
              <span className="text-[11px] text-gray-500 font-medium">{stat.label}</span>
              <span className={`text-[19px] font-semibold ${stat.color} leading-none`}>{stat.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Cards Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statsRow2.map((stat, index) => (
          <Link href={stat.href} key={index}>
            <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[88px] cursor-pointer hover:shadow-md transition">
              <span className="text-[11px] text-gray-500 font-medium">{stat.label}</span>
              <span className={`text-[19px] font-semibold ${stat.color} leading-none`}>{stat.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {quickLinks.map((link, index) => (
          <Link href={link.href} key={index}>
            <div className="bg-white py-10 px-4 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition h-full">
              {link.icon}
              <span className="text-[13px] font-semibold text-gray-800">{link.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
