"use client";

import { useEffect, useState } from "react";
import { Scissors, ShoppingCart } from "lucide-react";
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
          setVisibleCategories([]);
          return;
        }

        const location = JSON.parse(saved);
        setVisibleCategories(
          categories.filter((category) =>
            isCategoryAvailableAtLocation(
              category.zones_location,
              location.city || "",
              location.address || ""
            )
          )
        );
      } catch {
        setVisibleCategories([]);
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

  // Filter categories by type
  const homeServices = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("service")).slice(0, 6);
  const newProducts = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("product")).slice(0, 1);
  const amcProducts = visibleCategories.filter(c => c.type && c.type.toLowerCase().includes("amc")).slice(0, 1);

  return (
    <div className="relative bg-linear-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white w-full font-sans overflow-hidden py-4 md:py-10 px-4 md:px-10 lg:px-12">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 items-stretch justify-between">

        {/* Left Side: Title & Services Card */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4 md:space-y-5 z-10">

          {/* Mobile Carousel (Mobile Only) */}
          <div className="md:hidden">
            <MobileBannerCarousel banners={banners} />
          </div>

          <h1 className="hidden md:block text-[34px] lg:text-[44px] xl:text-[50px] font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-md">
            Home services at your <br /> doorsteps
          </h1>

          {/* Mobile Search Bar */}
          <LiveSearchBar className="md:hidden" />

          {/* Services Box */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl text-gray-800 flex flex-col flex-1 justify-between space-y-3">

            {/* Top Section: Home Services */}
            <div>
              <div className="flex items-center space-x-2 mb-0">
                <Scissors className="w-4 h-4 text-gray-800" />
                <h3 className="font-bold text-[17px] md:text-[19px] text-gray-900 tracking-tight">Home Services</h3>
              </div>
              <div className="grid grid-cols-3 gap-0 text-center justify-items-center">
                {homeServices.map((service, index) => (
                  <Link href={`/services/${service.id}`} key={index} className="flex flex-col items-center group w-full cursor-pointer">
                    <div className="w-20 h-20 sm:w-21.5 sm:h-21.5 md:w-22.5 md:h-22.5 bg-[#f4f5f8] rounded-2xl flex items-center justify-center text-[30px] md:text-[36px] shadow-sm group-hover:shadow-md transition-all overflow-hidden p-1 mb-1 group-hover:-translate-y-0.5">
                      {service.image_url && service.image_url.length > 5 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                      ) : (
                        <span>{getIcon(service.title)}</span>
                      )}
                    </div>
                    <span className="text-[11.5px] md:text-[12.5px] font-medium text-gray-800 leading-tight group-hover:text-black transition-colors px-0.5">{service.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 my-1"></div>

            {/* Bottom Section: New Products & AMC */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* New Products Card */}
              {newProducts.length > 0 && (
                <Link href={`/services/${newProducts[0].id}`} className="flex flex-col group cursor-pointer bg-[#f4f5f8] rounded-2xl p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-1.5 text-[#2c8af8] mb-1">
                    <ShoppingCart className="w-4 h-4" fill="currentColor" />
                    <span className="font-bold text-[13px] tracking-tight truncate leading-none pt-0.5">New Products</span>
                  </div>
                  <div className="flex justify-center items-center mt-0.5">
                    <div className="w-20 h-20 md:w-22 md:h-22 bg-white rounded-[14px] shrink-0 flex items-center justify-center shadow-sm overflow-hidden p-1 group-hover:-translate-y-0.5 transition-transform">
                      {newProducts[0].image_url && newProducts[0].image_url.length > 5 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={newProducts[0].image_url} alt={newProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* AMC Products Card */}
              {amcProducts.length > 0 && (
                <Link href={`/services/${amcProducts[0].id}`} className="flex flex-col group cursor-pointer bg-[#f4f5f8] rounded-2xl p-3 hover:bg-gray-100 transition-colors relative">
                  <div className="flex items-center space-x-1.5 text-[#21a868] mb-1">
                    <span className="font-bold text-[13px] tracking-tight truncate leading-none pt-0.5">RO AMC</span>
                  </div>
                  <div className="flex justify-center items-center mt-0.5">
                    <div className="w-20 h-20 md:w-22 md:h-22 bg-white rounded-[14px] shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden p-1 group-hover:-translate-y-0.5 transition-transform">
                      {amcProducts[0].image_url && amcProducts[0].image_url.length > 5 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={amcProducts[0].image_url} alt={amcProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>🛡️</span>
                      )}
                    </div>
                  </div>
                  <span className="absolute top-2.5 right-2.5 bg-[#21a868] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold shadow-sm">PRO</span>
                </Link>
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Masonry Images Grid */}
        <div className="w-full md:w-1/2 hidden md:flex items-stretch justify-center">
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
