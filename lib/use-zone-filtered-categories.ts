"use client";

import { useEffect, useMemo, useState } from "react";
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

let inFlight: { key: string; promise: Promise<number[] | null> } | null = null;

function fetchAllowedCategoryIds(location: UserLocationLike): Promise<number[] | null> {
  if (!location) return Promise.resolve(null);
  const lat =
    typeof location.latitude === "number" ? Math.round(location.latitude * 100) / 100 : "";
  const lng =
    typeof location.longitude === "number" ? Math.round(location.longitude * 100) / 100 : "";
  const key = `${lat}|${lng}|${location.city || ""}`;
  if (inFlight?.key === key) return inFlight.promise;

  try {
    const cached = sessionStorage.getItem(`omaa_zone_ids_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.at < 5 * 60 * 1000) {
        return Promise.resolve(parsed.ids as number[] | null);
      }
    }
  } catch {}

  const params = new URLSearchParams();
  if (lat !== "") params.set("lat", String(lat));
  if (lng !== "") params.set("lng", String(lng));
  if (location.city) params.set("city", location.city);

  const promise = fetch(`/api/zones/for-location?${params.toString()}`, {
    headers: { Accept: "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      const ids = Array.isArray(data.allowedCategoryIds) ? (data.allowedCategoryIds as number[]) : null;
      try {
        sessionStorage.setItem(`omaa_zone_ids_${key}`, JSON.stringify({ ids, at: Date.now() }));
      } catch {}
      return ids;
    })
    .catch(() => null);

  inFlight = { key, promise };
  return promise;
}

export function useZoneFilteredCategories<T extends LocatableCategory>(categories: T[]): T[] {
  const [location, setLocation] = useState<UserLocationLike>(null);
  const [allowedCategoryIds, setAllowedCategoryIds] = useState<number[] | null>(null);

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
    fetchAllowedCategoryIds(location).then((ids) => {
      if (!cancelled) setAllowedCategoryIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [location]);

  return useMemo(
    () => filterCategoriesByUserLocation(categories, location, allowedCategoryIds),
    [categories, location, allowedCategoryIds]
  );
}
