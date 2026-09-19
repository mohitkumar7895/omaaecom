import type { ZoneData } from "../app/actions/zones";
import { getAvailableCategoryIdsForLocation, isCategoryAvailableAtLocation } from "./zone-matcher";

export type LocatableCategory = {
  id: number;
  zones_location?: string | null;
};

export type UserLocationLike = {
  latitude?: number;
  longitude?: number;
  city?: string;
  address?: string;
  fullAddress?: string;
} | null;

export function filterCategoriesByUserLocation<T extends LocatableCategory>(
  categories: T[],
  location: UserLocationLike,
  zones: ZoneData[]
): T[] {
  if (!location || (!location.city && !location.address && !location.latitude)) {
    return categories;
  }

  const lat = location.latitude ?? null;
  const lng = location.longitude ?? null;
  const city = location.city || "";
  const address = location.address || "";
  const fullAddress = location.fullAddress || "";

  let next = categories;

  if (zones.length > 0) {
    const zoneMatch = getAvailableCategoryIdsForLocation(lat, lng, city, zones, categories);
    if (zoneMatch.matchedZoneNames.length > 0 && zoneMatch.allowedCategoryIds.length > 0) {
      const allowed = new Set(zoneMatch.allowedCategoryIds);
      next = next.filter((category) => allowed.has(Number(category.id)));
    }
  }

  next = next.filter((category) =>
    isCategoryAvailableAtLocation(category.zones_location, city, address, fullAddress)
  );

  return next.length > 0 ? next : categories;
}
