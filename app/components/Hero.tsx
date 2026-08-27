"use client";

import { useEffect, useState } from "react";
import { Home, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MobileBannerCarousel from "./MobileBannerCarousel";
import LiveSearchBar from "./LiveSearchBar";
import { isCategoryAvailableAtLocation } from "../../lib/zone-matcher";

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
}

export default function Hero({ categories = [], banners = [] }: HeroProps) {
  const [visibleCategories, setVisibleCategories] = useState<HeroCategory[]>([]);

  useEffect(() => {
    const filterCategories = () => {
      try {
        const saved = localStorage.getItem("user_location");
        if (!saved) {
          setVisibleCategories(categories);
          return;
        }

        const location = JSON.parse(saved);
        const filtered = categories.filter((category) =>
          isCategoryAvailableAtLocation(
            category.zones_location,
            location.city || "",
            location.address || "",
            location.fullAddress || ""
          )
        );
        setVisibleCategories(filtered);
      } catch {
        setVisibleCategories(categories);
      }
    };

    filterCategories();
    window.addEventListener("location_changed", filterCategories);
    window.addEventListener("storage", filterCategories);

    return () => {
      window.removeEventListener("location_changed", filterCategories);
      window.removeEventListener("storage", filterCategories);
    };
  }, [categories]);

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

  return (
    <div className="relative bg-linear-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white w-full font-sans overflow-hidden py-4 md:py-8 px-4 md:px-10 lg:px-12">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 items-start justify-between">

        {/* Left Side: Title & Services Card */}
        <div className="w-full md:w-1/2 flex flex-col space-y-3 md:space-y-4 z-10">

          {/* Mobile Carousel (Mobile Only) */}
          <div className="md:hidden">
            <MobileBannerCarousel banners={banners} />
          </div>

          <h1 className="hidden md:block text-[32px] lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-md">
            Home services at your <br /> doorsteps
          </h1>

          {/* Mobile Search Bar */}
          <LiveSearchBar className="md:hidden" />

          {/* Services Box (Urban Company Style) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-gray-800 flex flex-col space-y-5">

            {/* Top Section: Home Services */}
            <div>
              <h3 className="font-bold text-[18px] md:text-[20px] text-gray-900 tracking-tight mb-3">
                Home Services
              </h3>
              
              {/* 3-Column Wide-Tile Grid:
                  Row 1: Ac Repair & Services | Refrigerator Repair | Washing Machine
                  Row 2: Microwave Repair | Water Purifier */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center justify-items-center w-full">
                {orderedCategories.map((service, index) => (
                  <Link 
                    href={`/services/${service.id}`} 
                    key={index} 
                    className="flex flex-col items-center group w-full cursor-pointer"
                  >
                    {/* Sleek Compact Wide Tile */}
                    <div className="w-full h-16 sm:h-18 md:h-19 bg-[#f4f5f8] rounded-2xl flex items-center justify-center shadow-2xs group-hover:shadow-md transition-all overflow-hidden p-2 mb-1.5 group-hover:-translate-y-0.5">
                      {service.image_url && service.image_url.length > 5 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[28px] sm:text-[32px]">{getIcon(service.title)}</span>
                      )}
                    </div>
                    {/* Title Text (Dark & Bold - Strictly Equal Height) */}
                    <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2 px-0.5 h-8 sm:h-9 flex items-start justify-center text-center">
                      {service.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Row: Omaa Premium Package (New Products & RO AMC) */}
            {(newProducts.length > 0 || amcProducts.length > 0) && (
              <div className="pt-1 w-full">
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
                    padding-bottom: 4px;
                    padding-right: 6px;
                  }
                `}} />
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap sm:flex-nowrap">
                  <h4 className="omaa-premium-gradient font-black text-[20px] sm:text-[23px] md:text-[25px] tracking-tight leading-normal">
                    Omaa Premium Package
                  </h4>
                  <span className="text-[11px] sm:text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 shrink-0">
                    <span className="text-[13px]">✨</span> Premium
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center justify-items-center w-full">
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

        {/* Right Side: Masonry Images Grid */}
        <div className="w-full md:w-1/2 hidden md:flex items-stretch justify-center md:h-[550px]">
          <div className="flex gap-3 p-3 border-4 border-white/20 rounded-[28px] bg-white/10 shadow-xl backdrop-blur-sm w-full max-w-120 lg:max-w-130 h-full">
            {/* Left Tall Image */}
            <div className="w-1/2 h-full">
              <Image
                src="/Hero1.webp"
                alt="Cleaning Service"
                width={600}
                height={800}
                priority
                className="w-full h-full object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Right Stacked Images */}
            <div className="w-1/2 h-full flex flex-col gap-3">
              <Image
                src="/Hero 2.webp"
                alt="RO Repair"
                width={600}
                height={400}
                priority
                className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
              <Image
                src="/Hero3.webp"
                alt="AC Repair"
                width={600}
                height={400}
                priority
                className="w-full h-[calc(50%-6px)] object-cover rounded-[18px] shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
