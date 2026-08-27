import pool from "../../lib/db";
import Link from "next/link";
import { 
  CalendarCheck, 
  ListTree, 
  Settings, 
  Tag, 
  Users, 
  Image as ImageIcon, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  IndianRupee, 
  ClipboardList, 
  MessageSquare, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail
} from "lucide-react";

// Force dynamic rendering on every request for live metrics
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let bookingCount = 0;
  let categoryCount = 0;
  let serviceCount = 0;
  let brandCount = 0;
  let bannerCount = 0;
  let registrationCount = 0;
  let recentBookings: any[] = [];

  try {
    const [
      bookingsRes,
      categoriesRes,
      servicesRes,
      brandsRes,
      bannersRes,
      registrationsRes,
      recentBookingsRes
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM bookings").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT COUNT(*) as count FROM categories").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT COUNT(*) as count FROM services").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT COUNT(*) as count FROM brands").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT COUNT(*) as count FROM banners").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT COUNT(*) as count FROM technician_registrations").catch(() => [[{ count: 0 }]]),
      pool.query("SELECT id, name, mobile, address, total_amount, working_status, created_at, services FROM bookings ORDER BY created_at DESC LIMIT 5").catch(() => [[]]),
    ]);

    bookingCount = (bookingsRes[0] as any)[0]?.count || 0;
    categoryCount = (categoriesRes[0] as any)[0]?.count || 0;
    serviceCount = (servicesRes[0] as any)[0]?.count || 0;
    brandCount = (brandsRes[0] as any)[0]?.count || 0;
    bannerCount = (bannersRes[0] as any)[0]?.count || 0;
    registrationCount = (registrationsRes[0] as any)[0]?.count || 0;
    recentBookings = (recentBookingsRes[0] as any) || [];
  } catch (error) {
    console.error("Dashboard database queries error:", error);
  }

  // 1. Top Stats Cards - Sequence: Bookings -> Services -> Categories -> Registrations -> Brands -> Banners
  const statsCards = [
    {
      label: "Total Bookings",
      value: bookingCount.toString(),
      icon: <CalendarCheck className="w-5 h-5" />,
      color: "from-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/20",
      href: "/admin/booking",
      badge: "Live Orders"
    },
    {
      label: "Active Services",
      value: serviceCount.toString(),
      icon: <Settings className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      href: "/admin/services",
      badge: "Catalog"
    },
    {
      label: "Service Categories",
      value: categoryCount.toString(),
      icon: <ListTree className="w-5 h-5" />,
      color: "from-purple-600 to-indigo-600",
      shadow: "shadow-purple-500/20",
      href: "/admin/categories",
      badge: "Main Groups"
    },
    {
      label: "Partner Registrations",
      value: registrationCount.toString(),
      icon: <Users className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      href: "/admin/registration-records",
      badge: "Technicians"
    },
    {
      label: "Partner Brands",
      value: brandCount.toString(),
      icon: <Tag className="w-5 h-5" />,
      color: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20",
      href: "/admin/brands",
      badge: "Verified"
    },
    {
      label: "Live Banners",
      value: bannerCount.toString(),
      icon: <ImageIcon className="w-5 h-5" />,
      color: "from-cyan-600 to-blue-600",
      shadow: "shadow-cyan-500/20",
      href: "/admin/banners",
      badge: "Homepage"
    },
  ];

  // 2. Structured Quick Panels grouped by Category
  const managementSections = [
    {
      title: "1. Catalog & Pricing",
      desc: "Manage services, categories, and dynamic rate cards",
      items: [
        { name: "Categories", desc: "Main service categories", href: "/admin/categories", icon: <ListTree className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50" },
        { name: "Subcategories", desc: "Grouped service options", href: "/admin/subcategories", icon: <ListTree className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
        { name: "All Services", desc: "Add or edit service items", href: "/admin/services", icon: <Settings className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50" },
        { name: "Rate Cards", desc: "Tiered pricing & rate items", href: "/admin/rate-cards", icon: <IndianRupee className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" },
        { name: "Brands", desc: "Appliance brand partners", href: "/admin/brands", icon: <Tag className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
      ]
    },
    {
      title: "2. Bookings & Operations",
      desc: "Track customer orders, appointments, warranties, and support",
      items: [
        { name: "All Bookings", desc: "Master booking console", href: "/admin/booking", icon: <CalendarCheck className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50" },
        { name: "New Bookings", desc: "Fresh customer requests", href: "/admin/booking/new-booking", icon: <CalendarCheck className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50" },
        { name: "New Products", desc: "Appliance product orders", href: "/admin/booking/new-product", icon: <CalendarCheck className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
        { name: "RO AMC Plans", desc: "Maintenance contracts", href: "/admin/booking/amc", icon: <ShieldCheck className="w-5 h-5 text-teal-500" />, bg: "bg-teal-50" },
        { name: "Warranties", desc: "Active service warranties", href: "/admin/warranties", icon: <ShieldCheck className="w-5 h-5 text-cyan-500" />, bg: "bg-cyan-50" },
        { name: "Complaints", desc: "Customer help & tickets", href: "/admin/complaints", icon: <MessageSquare className="w-5 h-5 text-rose-500" />, bg: "bg-rose-50" },
        { name: "Contact Inquiries", desc: "Contact Us form messages", href: "/admin/contacts", icon: <Mail className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
      ]
    },
    {
      title: "3. Partners & Marketing",
      desc: "Review vendor onboardings, ads, and promotional banners",
      items: [
        { name: "KYC Approvals", desc: "Verify technician identities", href: "/admin/kyc", icon: <Users className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" },
        { name: "Registrations", desc: "Technician application records", href: "/admin/registration-records", icon: <ClipboardList className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50" },
        { name: "Homepage Banners", desc: "Hero sliders & promo images", href: "/admin/banners", icon: <ImageIcon className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
        { name: "Cashback Ads", desc: "Video & interactive promos", href: "/admin/cashback-ads", icon: <Sparkles className="w-5 h-5 text-pink-500" />, bg: "bg-pink-50" },
      ]
    },
    {
      title: "4. Settings & Policies",
      desc: "Configure system preferences, password, taxes, and legal terms",
      items: [
        { name: "System Settings & Password", desc: "Marquee text & admin security", href: "/admin/settings", icon: <Settings className="w-5 h-5 text-gray-700" />, bg: "bg-gray-100" },
        { name: "GST Settings", desc: "Tax rates & payment rules", href: "/admin/gst-settings", icon: <IndianRupee className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
        { name: "Privacy Policy", desc: "Customer data privacy terms", href: "/admin/privacy-policy", icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
        { name: "Terms & Conditions", desc: "Legal service agreements", href: "/admin/terms-and-conditions", icon: <ClipboardList className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
      ]
    }
  ];

  return (
    <div className="font-sans relative pb-12 space-y-10">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-12 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 lg:p-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/70 via-blue-50/30 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">OMAA Control Center Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back, Admin! 👋
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">
              Here is your centralized management dashboard. All operations, bookings, catalog items, and security controls are sequenced below.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/admin/booking">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2 text-sm cursor-pointer active:scale-95">
                <CalendarCheck className="w-4 h-4" />
                View All Bookings
              </button>
            </Link>
            <Link href="/admin/settings">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer active:scale-95">
                <Settings className="w-4 h-4 text-gray-600" />
                Settings
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Key Business Metrics Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Key Business Metrics</h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">Real-time counts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsCards.map((stat, index) => (
            <Link href={stat.href} key={index}>
              <div className="relative bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden h-[126px] flex flex-col justify-between">
                <div className="relative z-10 flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md ${stat.shadow} transform group-hover:scale-105 transition-transform duration-200`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{stat.badge}</span>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tight mb-1">{stat.value}</h3>
                  <p className="text-[12px] font-semibold text-gray-500 truncate">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Recent Bookings Activity Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Customer Bookings</h2>
              <p className="text-xs text-gray-500">Latest service and repair requests from the website</p>
            </div>
          </div>
          <Link href="/admin/booking" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition">
            <span>View Full Booking Console</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No customer bookings recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {recentBookings.map((b: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      <Link href="/admin/booking" className="hover:text-indigo-600">
                        #{b.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{b.name || "Customer"}</p>
                      <p className="text-xs text-gray-400">{b.mobile || "N/A"}</p>
                    </td>
                    <td className="px-5 py-4 max-w-[200px] truncate text-gray-600 font-medium">
                      {b.address || "N/A"}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      ₹{Number(b.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        b.working_status === "Complete" || b.working_status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : b.working_status === "In Progress"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : b.working_status === "Cancel" || b.working_status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {b.working_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Sequenced Management Hub */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Structured Management Hub</h2>
            <p className="text-sm text-gray-500 mt-0.5">Quick access organized systematically by section</p>
          </div>
        </div>

        {managementSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-3.5">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {sec.title}
              </h3>
              <p className="text-xs text-gray-500">{sec.desc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sec.items.map((item, itemIdx) => (
                <Link href={item.href} key={itemIdx}>
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] hover:border-indigo-100 cursor-pointer transition-all duration-300 group flex items-center gap-3.5 h-full">
                    <div className={`shrink-0 w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                    </div>
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
