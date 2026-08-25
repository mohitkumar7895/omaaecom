"use client";

import { useEffect, useState, useMemo } from "react";
import CategoryGrid from "./CategoryGrid";
import { isCategoryAvailableAtLocation } from "../../lib/zone-matcher";

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
}

export default function HomeCategoryStream({
  initialCategories,
  banners,
}: HomeCategoryStreamProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    city: string;
    address?: string;
  } | null>(null);

  // Sync user location from localStorage and events
  useEffect(() => {
    const checkLocation = () => {
      try {
        const saved = localStorage.getItem("user_location");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.latitude && parsed.longitude) {
            setUserLocation({
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              city: parsed.city || "",
              address: parsed.address || "",
            });
          }
        }
      } catch (e) {}
    };

    checkLocation();
    window.addEventListener("location_changed", checkLocation);
    window.addEventListener("storage", checkLocation);

    return () => {
      window.removeEventListener("location_changed", checkLocation);
      window.removeEventListener("storage", checkLocation);
    };
  }, []);

  // Filter categories by user zone
  const visibleCategories = useMemo(() => {
    if (!userLocation) return initialCategories;

    const filtered = initialCategories.filter((category) =>
      isCategoryAvailableAtLocation(
        category.zones_location,
        userLocation.city,
        userLocation.address,
        (userLocation as any).fullAddress
      )
    );

    return filtered.length > 0 ? filtered : initialCategories;
  }, [initialCategories, userLocation]);

  // Helper to match category rank according to exact required sequence:
  // 1. RO AMC
  // [Banner 1]
  // 2. AC Repair & Services
  // 3. Refrigerator Repair
  // [Banner 2]
  // 4. Washing Machine
  // 5. Microwave Repair
  // [Banner 3]
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

  const banner1 = banners[0] || null;
  const banner2 = banners[1] || null;
  const banner3 = banners[2] || null;
  const remainingBanners = banners.slice(3);

  return (
    <div className="mt-2 mb-10 space-y-2">
      
      {/* 1. RO AMC Category */}
      {roAmcCat && (
        <div id="services">
          <CategoryGrid title={roAmcCat.title} services={roAmcCat.services} />
        </div>
      )}

      {/* 2. Banner 1 */}
      {banner1 && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner1}
              alt="Promotion Banner 1"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
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

      {/* 5. Banner 2 */}
      {banner2 && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner2}
              alt="Promotion Banner 2"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
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

      {/* 8. Banner 3 */}
      {banner3 && (
        <div className="block max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-5 my-2 lg:my-4">
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-gray-50 flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner3}
              alt="Promotion Banner 3"
              className="w-full h-auto object-contain max-h-[260px] md:max-h-[320px] lg:max-h-[480px]"
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
                />
              </div>
            </div>
          )}
        </div>
      ))}

    </div>
  );
}
