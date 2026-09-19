"use client";

import { useEffect, useMemo, useState } from "react";
import type { ZoneData } from "../app/actions/zones";
import { filterCategoriesByUserLocation, type LocatableCategory, type UserLocationLike } from "./filter-categories-by-location";

function readUserLocation(): UserLocationLike {
  try {
    const saved = localStorage.getItem("user_location");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed || (!parsed.city && !parsed.address && !parsed.latitude)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useZoneFilteredCategories<T extends LocatableCategory>(categories: T[]): T[] {
  const [location, setLocation] = useState<UserLocationLike>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);

  useEffect(() => {
    setLocation(readUserLocation());

    const refresh = () => setLocation(readUserLocation());
    window.addEventListener("location_changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("location_changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/zones/active")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.zones)) setZones(data.zones);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => filterCategoriesByUserLocation(categories, location, zones),
    [categories, location, zones]
  );
}
