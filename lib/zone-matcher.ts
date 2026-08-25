import { ZoneData } from "../app/actions/zones";

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Ray-casting algorithm to test if a point is inside a polygon.
 * points: [{lat, lng}, {lat, lng}, ...]
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Determines whether a user coordinate is inside a given zone.
 */
export function isLocationInZone(
  lat: number,
  lng: number,
  zone: ZoneData,
  cityName?: string
): boolean {
  if (zone.status === "Inactive") return false;

  const coords = zone.coordinates;
  if (!coords) return false;

  // 1. Polygon Check
  if (coords.type === "polygon" && Array.isArray(coords.points) && coords.points.length >= 3) {
    if (isPointInPolygon({ lat, lng }, coords.points)) {
      return true;
    }
  }

  // 2. Center + Radius Check
  if (coords.center && coords.center.lat && coords.center.lng) {
    const radius = coords.radiusKm || 15; // default 15km
    const dist = getDistanceKm(lat, lng, coords.center.lat, coords.center.lng);
    if (dist <= radius) {
      return true;
    }
  }

  // 3. Fallback City Name Match
  if (cityName && zone.city_names) {
    const userCity = cityName.toLowerCase().trim();
    const zoneCities = zone.city_names
      .toLowerCase()
      .split(",")
      .map((c) => c.trim());
    if (zoneCities.some((c) => c.length > 1 && (userCity.includes(c) || c.includes(userCity)))) {
      return true;
    }
  }

  return false;
}

/**
 * Filters categories available for the user's location based on all active zones.
 * If user matches any zone(s), returns the union of categories for those zones.
 * If no active zones are defined in the system, returns all category IDs as a fallback.
 */
export function getAvailableCategoryIdsForLocation(
  lat: number | null,
  lng: number | null,
  cityName: string | null,
  allZones: ZoneData[],
  allCategories: Array<{ id: number }>
): {
  matchedZoneNames: string[];
  allowedCategoryIds: number[];
  isLocationRestricted: boolean;
} {
  const activeZones = allZones.filter((z) => z.status === "Active");

  // If no zones configured in DB, allow all categories
  if (activeZones.length === 0) {
    return {
      matchedZoneNames: ["All Areas"],
      allowedCategoryIds: allCategories.map((c) => c.id),
      isLocationRestricted: false,
    };
  }

  // If user location is unknown, default to all categories
  if (lat === null || lng === null) {
    return {
      matchedZoneNames: [],
      allowedCategoryIds: allCategories.map((c) => c.id),
      isLocationRestricted: false,
    };
  }

  const matchedZones: ZoneData[] = [];
  const allowedIdsSet = new Set<number>();

  for (const zone of activeZones) {
    if (isLocationInZone(lat, lng, zone, cityName || undefined)) {
      matchedZones.push(zone);
      zone.category_ids.forEach((id) => allowedIdsSet.add(Number(id)));
    }
  }

  if (matchedZones.length > 0) {
    return {
      matchedZoneNames: matchedZones.map((z) => z.name),
      allowedCategoryIds: Array.from(allowedIdsSet),
      isLocationRestricted: true,
    };
  }

  // User location is known, but outside of all defined zones:
  // Return empty list so we can indicate services are not in this zone yet
  return {
    matchedZoneNames: [],
    allowedCategoryIds: [],
    isLocationRestricted: true,
  };
}

/**
 * Determines whether a category is available in the selected location.
 * Category zones are stored as comma-separated city or area names.
 */
export function isCategoryAvailableAtLocation(
  zonesLocation: string | null | undefined,
  cityName: string,
  address?: string
): boolean {
  if (!zonesLocation?.trim()) return false;

  const locationText = `${cityName} ${address || ""}`.toLowerCase();
  return zonesLocation
    .split(",")
    .map((zone) => zone.trim().toLowerCase())
    .filter((zone) => zone.length > 1)
    .some((zone) => locationText.includes(zone));
}
