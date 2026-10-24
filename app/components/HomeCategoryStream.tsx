"use client";

import { useState, useEffect, useMemo } from "react";
import CategoryGrid from "./CategoryGrid";
import { filterCategoriesByUserLocation, type UserLocationLike } from "@/lib/filter-categories-by-location";

interface CategoryWithServices {
  id: number;
  title: string;
  image_url?: string;
  type?: string;
  zones_location?: string;
  services: any[];
}

interface HomeCategoryStreamProps {
  initialCategories: CategoryWithServices[];
  banners: string[];
  currentCity?: string;
}

export default function HomeCategoryStream({
  initialCategories,
  banners,
  currentCity,
}: HomeCategoryStreamProps) {
  const [userLocation, setUserLocation] = useState<UserLocationLike>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
          const parsed = JSON.parse(savedLocation);
          if (parsed) {
            setUserLocation(parsed);
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
    if (currentCity) {
      return filterCategoriesByUserLocation(initialCategories, { city: currentCity, address: currentCity, fullAddress: currentCity });
    }
    if (userLocation) {
      return filterCategoriesByUserLocation(initialCategories, userLocation);
    }
    return initialCategories;
  }, [initialCategories, userLocation, currentCity]);

  // Helper to match category rank according to exact sequence:
  // 1. RO AMC
  // 2. AC Repair & Services
  // 3. Refrigerator Repair
  // 4. Washing Machine
  // 5. Microwave Repair
  // 6. Water Purifier Repair
  const getCategoryRank = (title: string, type?: string) => {
    const t = (title || "").toLowerCase();
    const tp = (type || "").toLowerCase();

    if (t.includes("amc") || t.includes("ro amc") || tp.includes("amc")) return 1;
    if (t.includes("ac") || t.includes("air conditioner")) return 2;
    if (t.includes("refrigerator") || t.includes("fridge")) return 3;
    if (t.includes("washing") || t.includes("laundry")) return 4;
    if (t.includes("microwave") || t.includes("oven")) return 5;
    if (t.includes("water") || t.includes("purifier") || t.includes("ro repair")) return 6;
    return 10;
  };

  // Find categories by rank
  const roAmcCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 1);
  const acCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 2);
  const fridgeCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 3);
  const washingCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 4);
  const microwaveCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 5);
  const waterPurifierCat = visibleCategories.find((c) => getCategoryRank(c.title, c.type) === 6);

  // Remaining categories not in the primary 6
  const otherCats = visibleCategories.filter(
    (c) => getCategoryRank(c.title, c.type) >= 10
  );

  const banner1 = banners[0] || null; // RO AMC / Purifier banner
  const banner2 = banners[1] || null; // AC Repair banner
  const banner3 = banners[2] || null; // Fridge / Washing Machine banner
  const remainingBanners = banners.slice(3);

  // If no services available in selected area at all
  if (visibleCategories.length === 0) {
    const locationName = userLocation?.city || userLocation?.address || currentCity || "your area";
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 my-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-4xl mb-3">📍</span>
          <h3 className="text-lg font-bold text-gray-900">
            Services currently not available in {locationName}
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            OMAA Company verified doorstep appliance repair is currently operational across Noida, Greater Noida, Ghaziabad, Delhi, Faridabad & Gurgaon.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:9999251966"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              📞 Call 9999251966
            </a>
            <a
              href="https://wa.me/919999251966?text=Hi%2C%20I%20want%20to%20inquire%20about%20service%20in%20my%20area"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 mb-10 space-y-2">
      
      {/* 1. RO AMC Category */}
      {roAmcCat && (
        <div id="services">
          <CategoryGrid title={roAmcCat.title} services={roAmcCat.services} />
        </div>
      )}

      {/* 2. Banner 1 (RO / Purifier Banner) - Only show if RO AMC or Purifier is available */}
      {banner1 && (roAmcCat || waterPurifierCat) && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner1}
              alt="Promotion Banner 1"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("/banners/desktop-banner-1.png")) {
                  target.src = "/banners/desktop-banner-1.png";
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 3. AC Repair & Services */}
      {acCat && (
        <CategoryGrid title={acCat.title} services={acCat.services} />
      )}

      {/* 4. Refrigerator Repair */}
      {fridgeCat && (
        <CategoryGrid title={fridgeCat.title} services={fridgeCat.services} />
      )}

      {/* 5. Banner 2 (AC Repair Banner) - Only show if AC repair is active in this zone */}
      {banner2 && acCat && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner2}
              alt="Promotion Banner 2"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("/banners/desktop-banner-2.png")) {
                  target.src = "/banners/desktop-banner-2.png";
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Washing Machine */}
      {washingCat && (
        <CategoryGrid title={washingCat.title} services={washingCat.services} />
      )}

      {/* 7. Microwave Repair */}
      {microwaveCat && (
        <CategoryGrid title={microwaveCat.title} services={microwaveCat.services} />
      )}

      {/* 8. Banner 3 (Fridge & Washing Banner) - Only show if Fridge or Washing is active in this zone */}
      {banner3 && (fridgeCat || washingCat) && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner3}
              alt="Promotion Banner 3"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("/banners/desktop-banner-3.png")) {
                  target.src = "/banners/desktop-banner-3.png";
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 9. Water Purifier Repair */}
      {waterPurifierCat && (
        <CategoryGrid title={waterPurifierCat.title} services={waterPurifierCat.services} />
      )}

      {/* 10. Any other dynamic categories configured in admin */}
      {otherCats.map((cat, idx) => (
        <div key={cat.id || idx}>
          <CategoryGrid title={cat.title} services={cat.services} />
          {remainingBanners[idx] && (
            <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
              <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={remainingBanners[idx]}
                  alt="Promotion Banner"
                  className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("/banners/Banner2-RO-Service.jpg")) {
                      target.src = "/banners/Banner2-RO-Service.jpg";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

    </div>
  );
}
