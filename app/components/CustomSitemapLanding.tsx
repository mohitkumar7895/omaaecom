import Link from "next/link";
import { Phone, MessageCircle, ShieldCheck, Clock, Award, Star, CheckCircle2, ChevronRight, Wrench, Droplet, Wind, Refrigerator } from "lucide-react";

interface CustomSitemapLandingProps {
  pageData: {
    title: string;
    heading?: string | null;
    subheading?: string | null;
    content?: string | null;
    city?: string | null;
    area?: string | null;
    meta_description?: string | null;
    url: string;
  };
}

const PHONE = "9999251966";
const WHATSAPP_PHONE = "919999251966";

export default function CustomSitemapLanding({ pageData }: CustomSitemapLandingProps) {
  const displayTitle = pageData.heading || pageData.title;
  const areaName = pageData.area || "";
  const cityName = pageData.city || "Delhi NCR";
  const locationLabel = areaName ? `${areaName}, ${cityName}` : cityName;

  const whatsappMessage = encodeURIComponent(
    `Hello OMAA Company! I need home appliance repair in ${locationLabel}. Please confirm technician availability.`
  );

  const services = [
    {
      id: 5,
      name: "RO Water Purifier Repair",
      desc: "Filter change, membrane replacement, leakage & TDS repair.",
      price: "₹199",
      rating: "4.8★",
      icon: <Droplet className="w-6 h-6 text-sky-600" />,
      color: "from-sky-50 to-blue-50 border-sky-200",
    },
    {
      id: 7,
      name: "RO AMC Annual Plan",
      desc: "Complete maintenance, 4 free services & unlimited visits.",
      price: "₹3,999",
      rating: "4.9★",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: "from-emerald-50 to-teal-50 border-emerald-200",
    },
    {
      id: 1,
      name: "AC Repair & Foam Jet Service",
      desc: "Deep jet clean, gas refill, cooling issues & installation.",
      price: "₹499",
      rating: "4.8★",
      icon: <Wind className="w-6 h-6 text-indigo-600" />,
      color: "from-indigo-50 to-purple-50 border-indigo-200",
    },
    {
      id: 2,
      name: "Refrigerator Repair",
      desc: "No cooling, gas charging, compressor & thermostat check.",
      price: "₹199",
      rating: "4.8★",
      icon: <Refrigerator className="w-6 h-6 text-cyan-600" />,
      color: "from-cyan-50 to-sky-50 border-cyan-200",
    },
    {
      id: 3,
      name: "Washing Machine Service",
      desc: "Spin/drain repair, motor checkup for Front & Top load.",
      price: "₹199",
      rating: "4.8★",
      icon: <Wrench className="w-6 h-6 text-amber-600" />,
      color: "from-amber-50 to-orange-50 border-amber-200",
    },
  ];

  return (
    <div className="bg-slate-50 text-gray-800">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[#5c67b8] font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                /
              </li>
              <li>
                <Link href="/sitemap-directory" className="hover:text-[#5c67b8] font-medium transition-colors">
                  Service Directory
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                /
              </li>
              <li className="text-gray-900 font-semibold truncate max-w-[240px] sm:max-w-none">
                {displayTitle}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-gray-100 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-semibold mb-4 border border-indigo-100/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>📍 Verified Service in {locationLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {displayTitle}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed mb-6">
              {pageData.subheading ||
                pageData.content ||
                `Doorstep repair & service in ${locationLabel}. Certified technicians, transparent pricing, genuine parts and 30-day service warranty.`}
            </p>

            {/* CALL & WHATSAPP ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:+91${PHONE}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#5c67b8] hover:bg-[#4b55a0] text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 transition-all active:scale-[0.97]"
              >
                <Phone className="w-5 h-5 fill-current" />
                <span>Call {PHONE}</span>
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-200 transition-all active:scale-[0.97]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>WhatsApp Chat</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>30-Day Service Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>60-Min Doorstep Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>4.8★ Verified Experts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Doorstep Appliance Services in {locationLabel}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select a service below for instant doorstep booking.
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs sm:text-sm font-bold text-[#5c67b8] hover:underline flex items-center gap-1"
          >
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 bg-gradient-to-br ${item.color} flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs">{item.icon}</div>
                  <span className="text-xs font-extrabold text-gray-700 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                    {item.rating}
                  </span>
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Inspection from</span>
                  <p className="text-base font-black text-gray-900">{item.price}</p>
                </div>
                <Link
                  href={`/services/${item.id}`}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-xs"
                >
                  Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-white border-y border-gray-100 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">30-Day Guarantee</h4>
              <p className="text-xs text-gray-500">Free re-visit if the same issue reoccurs within 30 days.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Genuine Spare Parts</h4>
              <p className="text-xs text-gray-500">100% genuine parts with manufacturer warranty.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Fast 60-Min Arrival</h4>
              <p className="text-xs text-gray-500">Local technicians assigned within your locality.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
