"use client";

import { useState, useEffect } from "react";
import { Home, ShoppingCart, ShieldCheck, Sparkles, Copy, Check, Share2 } from "lucide-react";
import Link from "next/link";
import MobileBannerCarousel from "./MobileBannerCarousel";
import LiveSearchBar from "./LiveSearchBar";

interface HeroCategory {
  id: number;
  title: string;
  type?: string;
  image_url?: string;
  zones_location?: string;
}

interface HeroProps {
  categories?: HeroCategory[];
  banners?: string[];
  hideHeadline?: boolean;
}

export default function Hero({ categories = [], banners = [], hideHeadline = false }: HeroProps) {
  const [userCity, setUserCity] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("https://omaacompany.com/wallet?ref=OC564990");

  useEffect(() => {
    // Check local stored user
    try {
      const stored = localStorage.getItem("omaa_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.referral_code) {
          setReferralLink(`https://omaacompany.com/wallet?ref=${u.referral_code}`);
        }
      }
    } catch (e) {}

    // Fetch from auth/me if available
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.referral_code) {
          setReferralLink(`https://omaacompany.com/wallet?ref=${d.user.referral_code}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const message = `Hey! Book Doorstep RO, AC & Home Appliance Repair on OMAA Company. Get 100 Welcome Points instantly on wallet: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
          const parsed = JSON.parse(savedLocation);
          if (parsed && parsed.city) {
            setUserCity(parsed.city);
          }
        }
      } catch (e) {}
    };
    handleLocationChange();
    window.addEventListener("location_changed", handleLocationChange);
    window.addEventListener("storage", handleLocationChange);
    return () => {
      window.removeEventListener("location_changed", handleLocationChange);
      window.removeEventListener("storage", handleLocationChange);
    };
  }, []);

  const visibleCategories = categories.filter((cat) => {
    if (!userCity) return true;
    if (!cat.zones_location) return true;
    
    const zones = cat.zones_location.split(',').map((z) => z.trim().toLowerCase());
    const city = userCity.toLowerCase();
    
    if (zones.length === 0 || zones.includes("all") || zones.includes("")) return true;
    
    return zones.some(zone => city.includes(zone) || zone.includes(city));
  });

  const getIcon = (title: string) => {
    if (title.includes("Ac Repair")) return "❄️";
    if (title.includes("Refrigerator")) return "🧊";
    if (title.includes("Washing")) return "👕";
    if (title.includes("Microwave")) return "♨️";
    if (title.includes("Water Purifier")) return "🚰";
    if (title.includes("Product")) return "📦";
    if (title.includes("AMC")) return "🛡️";
    return "🔧";
  };

  // Filter categories by type and order them explicitly:
  // Col 1: AC -> Microwave
  // Col 2: Refrigerator -> Water Purifier
  // Col 3: Washing Machine
  const allServices = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("service"));
  
  const findService = (query: string) => 
    allServices.find(s => s.title.toLowerCase().includes(query.toLowerCase()));

  const acService = findService("ac");
  const fridgeService = findService("refrigerator");
  const washingService = findService("washing");
  const microwaveService = findService("microwave");
  const roService = findService("water") || findService("purifier") || findService("ro");

  const orderedCategories = [
    acService,        // Col 1, Row 1 (AC)
    fridgeService,    // Col 2, Row 1 (Refrigerator)
    washingService,   // Col 3, Row 1 (Washing Machine)
    microwaveService, // Col 1, Row 2 (Microwave - under AC!)
    roService,        // Col 2, Row 2 (Water Purifier - under Refrigerator!)
  ].filter(Boolean) as HeroCategory[];

  // Fallback if any missing
  const usedIds = new Set(orderedCategories.map(s => s.id));
  const remainingServices = allServices.filter(s => !usedIds.has(s.id));
  while (orderedCategories.length < 5 && remainingServices.length > 0) {
    orderedCategories.push(remainingServices.shift()!);
  }

  const newProducts = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("product")).slice(0, 1);
  const amcProducts = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("amc")).slice(0, 1);

  // Check if ALL 7 services/packages are available:
  // Home Services (5): AC, Refrigerator, Washing Machine, Microwave, RO / Water Purifier
  // OMAA Premium Package (2): New Products, RO AMC
  const hasAc = Boolean(acService);
  const hasFridge = Boolean(fridgeService);
  const hasWashing = Boolean(washingService);
  const hasMicrowave = Boolean(microwaveService);
  const hasRo = Boolean(roService);
  const hasNewProducts = newProducts.length > 0;
  const hasAmc = amcProducts.length > 0;

  const isAllCategoriesShown = Boolean(
    hasAc &&
    hasFridge &&
    hasWashing &&
    hasMicrowave &&
    hasRo &&
    hasNewProducts &&
    hasAmc
  );

  // Reusable Referral Card Component
  const renderReferralCard = (customWidthClass = "max-w-120 lg:max-w-130") => (
    <div className={`w-full ${customWidthClass} rounded-[22px] p-[2.5px] bg-linear-to-r from-amber-400 via-pink-500 to-indigo-500 shadow-xl transition-transform duration-300 hover:scale-[1.005]`}>
      <div className="bg-white/95 backdrop-blur-xl rounded-[20px] p-3 sm:p-3.5 text-gray-900 flex flex-col gap-2.5">
        
        {/* Header with Badges */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[13px] font-black text-gray-900 tracking-tight leading-none">
                  Refer & Earn ₹400 + ₹200 Cash
                </h4>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Direct
                </span>
              </div>
              <p className="text-[10.5px] text-gray-500 mt-0.5 font-medium leading-none">
                Direct cash to your bank or UPI on RO AMC & Products
              </p>
            </div>
          </div>

          <Link 
            href="/wallet" 
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 group"
          >
            <span>Wallet</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Link Input Bar with Copy & WhatsApp Share */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400 text-xs font-mono font-bold">
              🔗
            </div>
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full pl-7 pr-2.5 h-8 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
          </div>

          {/* Copy Button (Icon only) */}
          <button
            type="button"
            onClick={handleCopyLink}
            title={copied ? "Copied to clipboard!" : "Copy link"}
            aria-label="Copy referral link"
            className={`w-8 h-8 rounded-lg transition-all shadow-xs shrink-0 flex items-center justify-center cursor-pointer active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-300"
                : "bg-gray-900 hover:bg-black text-white hover:shadow-xs"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* WhatsApp Share Button (Icon only) */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            className="w-8 h-8 rounded-lg text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-xs hover:shadow-sm shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 border-t border-gray-100 text-center">
          <div className="bg-amber-50/70 border border-amber-200/60 rounded py-0.5 px-1">
            <span className="block text-[9.5px] font-black text-amber-900 leading-tight">₹400 Cash</span>
            <span className="text-[8.5px] text-amber-700 font-medium">Level 1 Direct</span>
          </div>
          <div className="bg-purple-50/70 border border-purple-200/60 rounded py-0.5 px-1">
            <span className="block text-[9.5px] font-black text-purple-900 leading-tight">₹200 Cash</span>
            <span className="text-[8.5px] text-purple-700 font-medium">Level 2 Indirect</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded py-0.5 px-1">
            <span className="block text-[9.5px] font-black text-emerald-900 leading-tight">100 Pts</span>
            <span className="text-[8.5px] text-emerald-700 font-medium">Friend Welcome</span>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="relative bg-linear-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white w-full font-sans overflow-hidden py-4 md:py-8 px-4 md:px-10 lg:px-12">

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 md:gap-6 items-start justify-between">

        {/* Left Side: Title & Services Card */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-3 md:space-y-4 z-10">

          {/* Mobile / tablet promotional banners */}
          <div className="lg:hidden">
            <MobileBannerCarousel banners={banners} />
          </div>

          {!hideHeadline && (
            <h1 className="text-[26px] sm:text-[32px] lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-md">
              Home appliance repair at your doorstep
            </h1>
          )}

          {/* Mobile Search Bar */}
          <LiveSearchBar className="md:hidden" />

          {/* Services Box (Urban Company Style) — 3-color gradient border */}
          <div className="rounded-3xl p-[3px] shadow-2xl bg-linear-to-r from-[#4f6fff] via-[#a855f7] to-[#f43f8c]">
          <div className="bg-white rounded-[21px] p-5 sm:p-6 text-gray-800 flex flex-col space-y-5">

            {/* Top Section: Home Services */}
            <div>
              <h3 className="font-bold text-[18px] md:text-[20px] text-gray-900 tracking-tight mb-3">
                Home Services
              </h3>
              
              {/* Mobile View: Row 1 (3 cols) + Row 2 (2 cols full width) */}
              <div className="md:hidden space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center justify-items-center w-full">
                  {orderedCategories.slice(0, 3).map((service, index) => (
                    <Link 
                      href={`/services/${service.id}`} 
                      key={index} 
                      className="flex flex-col items-center group w-full cursor-pointer"
                    >
                      <div className="w-full h-16 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                        {service.image_url && service.image_url.length > 5 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[28px]">{getIcon(service.title)}</span>
                        )}
                      </div>
                      <span className="text-[12px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-8 flex items-start justify-center text-center">
                        {service.title}
                      </span>
                    </Link>
                  ))}
                </div>

                {orderedCategories.length > 3 && (
                  <div className="grid grid-cols-2 gap-3 text-center justify-items-center w-full">
                    {orderedCategories.slice(3, 5).map((service, index) => (
                      <Link 
                        href={`/services/${service.id}`} 
                        key={index + 3} 
                        className="flex flex-col items-center group w-full cursor-pointer"
                      >
                        <div className="w-full h-16 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                          {service.image_url && service.image_url.length > 5 ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[28px]">{getIcon(service.title)}</span>
                          )}
                        </div>
                        <span className="text-[12px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-8 flex items-start justify-center text-center">
                          {service.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View: Exact Original 3-Column Layout */}
              <div className="hidden md:grid md:grid-cols-3 gap-4 text-center justify-items-center w-full">
                {orderedCategories.map((service, index) => (
                  <Link 
                    href={`/services/${service.id}`} 
                    key={index} 
                    className="flex flex-col items-center group w-full cursor-pointer"
                  >
                    <div className="w-full h-18 md:h-19 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                      {service.image_url && service.image_url.length > 5 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[32px]">{getIcon(service.title)}</span>
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-9 flex items-start justify-center text-center">
                      {service.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Row: OMAA PREMIUM PACKAGE (New Products & RO AMC) */}
            {(newProducts.length > 0 || amcProducts.length > 0) && (
              <div className="pt-2 w-full">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes premium-shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  .omaa-premium-gradient {
                    background: linear-gradient(90deg, #1d4ed8, #7c3aed, #06b6d4, #2563eb);
                    background-size: 250% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: premium-shimmer 4s ease infinite;
                    display: inline-block;
                    padding-bottom: 2px;
                    padding-right: 4px;
                  }
                `}} />
                <div className="mb-3">
                  <h3 className="omaa-premium-gradient font-black text-[17px] sm:text-[19px] md:text-[20px] tracking-tight uppercase">
                    OMAA PREMIUM PACKAGE
                  </h3>
                </div>

                {/* 2 Cols on Mobile (Full Width), 3 Cols on Desktop (Original Alignment) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-center justify-items-center w-full">
                  {/* New Products */}
                  {newProducts.length > 0 && (
                    <Link 
                      href={`/services/${newProducts[0].id}`} 
                      className="flex flex-col items-center group w-full cursor-pointer"
                    >
                      <div className="w-full h-16 sm:h-18 md:h-19 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                        {newProducts[0].image_url && newProducts[0].image_url.length > 5 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={newProducts[0].image_url} alt={newProducts[0].title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[28px] sm:text-[32px]">📦</span>
                        )}
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-8 sm:h-9 flex items-start justify-center text-center">
                        {newProducts[0].title || "New Products"}
                      </span>
                    </Link>
                  )}

                  {/* RO AMC */}
                  {amcProducts.length > 0 && (
                    <Link 
                      href={`/services/${amcProducts[0].id}`} 
                      className="flex flex-col items-center group w-full cursor-pointer"
                    >
                      <div className="w-full h-16 sm:h-18 md:h-19 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                        {amcProducts[0].image_url && amcProducts[0].image_url.length > 5 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={amcProducts[0].image_url} alt={amcProducts[0].title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[28px] sm:text-[32px]">🛡️</span>
                        )}
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-8 sm:h-9 flex items-start justify-center text-center">
                        {amcProducts[0].title || "RO AMC"}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}

          </div>
          </div>

          {/* Referral Card under Categories:
              - On Mobile: ALWAYS visible here
              - On Desktop: Visible here ONLY if any service is missing (!isAllCategoriesShown)
          */}
          <div className={`${isAllCategoriesShown ? "lg:hidden" : ""} w-full`}>
            {renderReferralCard("w-full")}
          </div>

        </div>

        {/* Right Side: Masonry Images Grid */}
        {isAllCategoriesShown ? (
          /* When ALL 7 categories are shown: compact image height + Referral Card directly below images */
          <div className="w-full lg:w-1/2 hidden lg:flex flex-col items-center gap-3">
            <div className="flex gap-3 p-3 border-4 border-white/20 rounded-[28px] bg-white/10 shadow-xl backdrop-blur-sm w-full max-w-120 lg:max-w-130 h-[430px] xl:h-[450px]">
              {/* Left Tall Image */}
              <div className="w-1/2 h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero1.webp"
                  alt="OMAA technician providing doorstep home appliance repair"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Right Stacked Images */}
              <div className="w-1/2 h-full flex flex-col gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero 2.webp"
                  alt="RO water purifier repair and service at home"
                  width={600}
                  height={400}
                  className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero3.webp"
                  alt="Air conditioner doorstep repair and gas refill"
                  width={600}
                  height={400}
                  className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>

            {/* Ultra-Premium Referral Card directly under images */}
            {renderReferralCard("max-w-120 lg:max-w-130")}
          </div>
        ) : (
          /* When any category is missing: Full original 550px height images with NO card below images */
          <div className="w-full lg:w-1/2 hidden lg:flex items-stretch justify-center lg:h-[550px]">
            <div className="flex gap-3 p-3 border-4 border-white/20 rounded-[28px] bg-white/10 shadow-xl backdrop-blur-sm w-full max-w-120 lg:max-w-130 h-full">
              {/* Left Tall Image */}
              <div className="w-1/2 h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero1.webp"
                  alt="OMAA technician providing doorstep home appliance repair"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Right Stacked Images */}
              <div className="w-1/2 h-full flex flex-col gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero 2.webp"
                  alt="RO water purifier repair and service at home"
                  width={600}
                  height={400}
                  className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero3.webp"
                  alt="Air conditioner doorstep repair and gas refill"
                  width={600}
                  height={400}
                  className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
