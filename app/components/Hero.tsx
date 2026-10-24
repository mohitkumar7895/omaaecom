"use client";

import { useState, useEffect, useMemo } from "react";
import { Home, ShoppingCart, ShieldCheck, Sparkles, Copy, Check, Share2 } from "lucide-react";
import Link from "next/link";
import MobileBannerCarousel from "./MobileBannerCarousel";
import LiveSearchBar from "./LiveSearchBar";
import { getRandomReferralCode, getActiveReferralCode, fetchCurrentUser } from "@/lib/client-auth";

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
  currentCity?: string;
}

export default function Hero({
  categories = [],
  banners = [],
  hideHeadline = false,
  currentCity,
}: HeroProps) {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState(() => `https://omaacompany.com/?ref=${getActiveReferralCode()}`);

  useEffect(() => {
    const syncCode = (code: string) => {
      if (code && !code.startsWith("OC") && code.length === 6) {
        setReferralLink(`https://omaacompany.com/?ref=${code}`);
        try {
          localStorage.setItem("omaa_active_ref", code);
        } catch (e) {}
      }
    };

    syncCode(getActiveReferralCode());

    fetchCurrentUser()
      .then((u) => {
        if (u?.referral_code) {
          syncCode(u.referral_code);
        }
      })
      .catch(() => {});

    const handleSync = () => {
      syncCode(getActiveReferralCode());
    };

    window.addEventListener("auth_changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("auth_changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const message = `Hey! Book Doorstep RO, AC & Home Appliance Repair on OMAA Company. Get rewards on wallet: ${referralLink}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "OMAA Company - Refer & Earn",
          text: message,
          url: referralLink,
        });
        return;
      } catch (e) {
        // Fallback to WhatsApp if share dialog was dismissed or failed
      }
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const [userCity, setUserCity] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
          const parsed = JSON.parse(savedLocation);
          if (parsed && (parsed.city || parsed.shortAddress || parsed.address)) {
            setUserCity(parsed.city || parsed.shortAddress || parsed.address);
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

  const visibleCategories = useMemo(() => {
    const activeLoc = currentCity || userCity;
    if (!activeLoc) return categories;

    const filtered = categories.filter((cat) => {
      if (!cat.zones_location) return true;
      const zones = cat.zones_location.split(",").map((z) => z.trim().toLowerCase());
      const loc = activeLoc.toLowerCase();
      if (zones.length === 0 || zones.includes("all") || zones.includes("")) return true;
      return zones.some((zone) => loc.includes(zone) || zone.includes(loc));
    });

    return filtered.length > 0 ? filtered : categories;
  }, [categories, userCity, currentCity]);

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
  const fallbackServices = categories.filter(c => c.type && c.type.toLowerCase().includes("service"));
  const servicesToUse = allServices.length > 0 ? allServices : fallbackServices;
  
  const findService = (query: string) => 
    servicesToUse.find(s => s.title.toLowerCase().includes(query.toLowerCase()));

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
  const remainingServices = servicesToUse.filter(s => !usedIds.has(s.id));
  while (orderedCategories.length < 5 && remainingServices.length > 0) {
    orderedCategories.push(remainingServices.shift()!);
  }

  const newProducts = (visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("product")).length > 0
    ? visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("product"))
    : categories.filter(c => c.type && c.type.toLowerCase().includes("product"))).slice(0, 1);

  const amcProducts = (visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("amc")).length > 0
    ? visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("amc"))
    : categories.filter(c => c.type && c.type.toLowerCase().includes("amc"))).slice(0, 1);

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
      <div className="bg-white/95 backdrop-blur-xl rounded-[20px] p-3.5 sm:p-4 text-gray-900 flex flex-col gap-3">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <h4 className="text-[12px] xs:text-[13.5px] sm:text-[15px] font-black text-gray-900 tracking-tight leading-none whitespace-nowrap min-w-0">
            Welcome Bonus & Refer to Earn
          </h4>

          {/* Clickable Gift Icon + 100 Pts opens Wallet Page */}
          <Link 
            href="/wallet"
            title="Open Wallet"
            className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-[20px] sm:text-[23px] leading-none select-none">🎁</span>
            <span className="text-[12.5px] sm:text-[14px] font-black text-amber-600 hover:text-amber-700 tracking-tight">
              100 Pts
            </span>
          </Link>
        </div>

        {/* Link Input Bar with Copy & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full px-2 sm:px-2.5 h-8.5 sm:h-9 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-lg text-[9.5px] xs:text-[10px] sm:text-xs font-mono font-bold tracking-tight sm:tracking-normal text-gray-800 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
          </div>

          {/* Copy Button (Icon only) */}
          <button
            type="button"
            onClick={handleCopyLink}
            title={copied ? "Copied to clipboard!" : "Copy link"}
            aria-label="Copy referral link"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all shadow-xs shrink-0 flex items-center justify-center cursor-pointer active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-300"
                : "bg-gray-900 hover:bg-black text-white hover:shadow-xs"
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Share Button (Icon only) */}
          <button
            type="button"
            onClick={handleShare}
            title="Share referral link"
            aria-label="Share referral link"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs hover:shadow-sm shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
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
                      prefetch={true}
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
                        prefetch={true}
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
                    prefetch={true}
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
                      prefetch={true}
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
                      prefetch={true}
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
