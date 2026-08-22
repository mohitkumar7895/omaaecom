import { List, AlignJustify, Settings, IndianRupee, Contact, CalendarCheck, Image as ImageIcon, Tag, Users, ArrowUpRight, TrendingUp } from "lucide-react";
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
    { label: "Total Categories", value: categoryCount.toString(), icon: <List className="w-6 h-6" />, color: "from-blue-600 to-cyan-500", shadow: "shadow-blue-500/20", href: "/admin/categories", trend: "+12%" },
    { label: "Active Services", value: serviceCount.toString(), icon: <Settings className="w-6 h-6" />, color: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-500/20", href: "/admin/services", trend: "+5%" },
    { label: "Total Brands", value: brandCount.toString(), icon: <Tag className="w-6 h-6" />, color: "from-orange-500 to-amber-400", shadow: "shadow-orange-500/20", href: "/admin/brands", trend: "+8%" },
    { label: "Live Banners", value: bannerCount.toString(), icon: <ImageIcon className="w-6 h-6" />, color: "from-violet-600 to-purple-500", shadow: "shadow-violet-500/20", href: "/admin/banners", trend: "+2%" },
    { label: "System Admins", value: adminCount.toString(), icon: <Users className="w-6 h-6" />, color: "from-pink-500 to-rose-400", shadow: "shadow-pink-500/20", href: "/admin/register", trend: "Stable" },
    { label: "Pending Bookings", value: "0", icon: <CalendarCheck className="w-6 h-6" />, color: "from-indigo-600 to-blue-500", shadow: "shadow-indigo-500/20", href: "/admin/booking", trend: "0 Today" },
  ];

  const quickLinks = [
    { name: "Manage Categories", desc: "Organize your service catalog visually.", icon: <List className="w-6 h-6 text-blue-500" />, href: "/admin/categories", bg: "bg-blue-50" },
    { name: "Service Offerings", desc: "Add, edit, or remove services.", icon: <Settings className="w-6 h-6 text-emerald-500" />, href: "/admin/services", bg: "bg-emerald-50" },
    { name: "Rate Cards", desc: "Configure dynamic pricing rules.", icon: <IndianRupee className="w-6 h-6 text-amber-500" />, href: "/admin/rate-cards", bg: "bg-amber-50" },
    { name: "KYC Approvals", desc: "Verify new vendor identities.", icon: <Contact className="w-6 h-6 text-rose-500" />, href: "/admin/kyc", bg: "bg-rose-50" },
    { name: "Booking Console", desc: "View all customer appointments.", icon: <CalendarCheck className="w-6 h-6 text-indigo-500" />, href: "/admin/booking", bg: "bg-indigo-50" },
    { name: "Promotional Banners", desc: "Update homepage hero images.", icon: <ImageIcon className="w-6 h-6 text-violet-500" />, href: "/admin/banners", bg: "bg-violet-50" },
  ];

  return (
    <div className="font-sans relative pb-12">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-12 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Welcome Section */}
      <div className="mb-10 relative overflow-hidden rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">System Online & Optimized</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back, Admin!</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">Here's a comprehensive overview of your business today. Everything is running smoothly. Ready to manage your platform?</p>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <Link href="/admin/booking">
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center gap-2 text-sm">
                View All Bookings
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Business Metrics
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-12">
        {statsRow1.map((stat, index) => (
          <Link href={stat.href} key={index}>
            <div className={`relative bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group overflow-hidden h-[130px] flex flex-col justify-between`}>
              {/* Subtle gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} transform group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{stat.trend}</span>
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tight mb-1">{stat.value}</h3>
                <p className="text-[13px] font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Quick Actions
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {quickLinks.map((link, index) => (
          <Link href={link.href} key={index}>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] hover:border-indigo-100 cursor-pointer transition-all duration-300 group flex items-center gap-4 h-full">
              <div className={`shrink-0 w-12 h-12 rounded-2xl ${link.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-0.5 truncate">{link.name}</h3>
                <p className="text-[13px] text-gray-500 truncate">{link.desc}</p>
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
