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

export interface CategoryWithLocationInfo {
  id: number;
  title?: string;
  type?: string;
  zones_location?: string;
}

/**
 * Filters categories available for the user's location based on:
 * 1. Predefined service_zones (geometry/circle/city_names match -> zone.category_ids)
 * 2. categories.zones_location (locality/city tokens match)
 * Returns the exact list of category IDs active for that location.
 */
export function getAvailableCategoryIdsForLocation(
  lat: number | null,
  lng: number | null,
  cityName: string | null,
  allZones: ZoneData[],
  allCategories: Array<CategoryWithLocationInfo>
): {
  matchedZoneNames: string[];
  allowedCategoryIds: number[];
  isLocationRestricted: boolean;
} {
  const activeZones = allZones.filter((z) => z.status === "Active");

  const hasCoords =
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(Number(lat) === 0 && Number(lng) === 0);

  if (!hasCoords && !cityName) {
    return {
      matchedZoneNames: [],
      allowedCategoryIds: allCategories.map((c) => c.id),
      isLocationRestricted: false,
    };
  }

  // 1. Check which service_zones match by coords or city_names
  const matchedZones: ZoneData[] = [];
  const zoneAllowedIdsSet = new Set<number>();

  for (const zone of activeZones) {
    let inZone = false;
    if (hasCoords) {
      inZone = isLocationInZone(Number(lat), Number(lng), zone, cityName || undefined);
    } else if (cityName && zone.city_names) {
      const userCity = cityName.toLowerCase().trim();
      const zoneCities = zone.city_names
        .toLowerCase()
        .split(",")
        .map((c) => c.trim());
      inZone = zoneCities.some((c) => c.length > 1 && (userCity.includes(c) || c.includes(userCity)));
    }

    if (inZone) {
      matchedZones.push(zone);
      const ids = Array.isArray(zone.category_ids) ? zone.category_ids : [];
      if (ids.length > 0) {
        ids.forEach((id) => zoneAllowedIdsSet.add(Number(id)));
      }
    }
  }

  // 2. Check categories by zones_location
  const categoryMatchedIds = new Set<number>();
  if (cityName) {
    const locTokens = expandLocationAliases(cityName);
    for (const cat of allCategories) {
      if (!cat.zones_location) continue;
      const zones = cat.zones_location.split(",").map((z) => z.trim().toLowerCase()).filter(Boolean);
      if (zones.some((z) => z === "all" || z === "pan india")) {
        categoryMatchedIds.add(Number(cat.id));
        continue;
      }
      const isMatch = zones.some((z) =>
        locTokens.some((tok) => tok === z || tok.includes(z) || z.includes(tok))
      );
      if (isMatch) {
        categoryMatchedIds.add(Number(cat.id));
      }
    }
  }

  // 3. Combine results based on rule:
  // "jon se zone mai jitnii service lagi vo dikhu bhai yrr"
  if (matchedZones.length > 0) {
    let finalIds: number[] = [];
    if (zoneAllowedIdsSet.size > 0) {
      // Explicit category_ids configured in Admin Zone Manager
      finalIds = Array.from(zoneAllowedIdsSet);
    } else if (categoryMatchedIds.size > 0) {
      finalIds = Array.from(categoryMatchedIds);
    } else {
      finalIds = allCategories.map((c) => c.id);
    }

    return {
      matchedZoneNames: matchedZones.map((z) => z.name),
      allowedCategoryIds: finalIds,
      isLocationRestricted: true,
    };
  }

  // If no zone polygon matched, but location matched categories in zones_location (e.g. Bharthana):
  if (categoryMatchedIds.size > 0) {
    let cleanName = "Local Service Area";
    if (cityName) {
      const parts = cityName.split(",").map((p) => p.trim()).filter(Boolean);
      // Pick the city name or meaningful locality (usually the last non-numeric token)
      const candidate = parts.slice().reverse().find((p) => !/^\d+$/.test(p) && p.length > 2);
      cleanName = candidate ? `${candidate} Area` : `${parts[0]} Area`;
    }
    return {
      matchedZoneNames: [cleanName],
      allowedCategoryIds: Array.from(categoryMatchedIds),
      isLocationRestricted: true,
    };
  }

  // Outside any zone and no category assigned
  return {
    matchedZoneNames: [],
    allowedCategoryIds: [],
    isLocationRestricted: true,
  };
}

/**
/**
 * Normalizes and expands locality names to their parent zone and aliases.
 * E.g. "Noida Extension" -> ["noida extension", "greater noida west", "greater noida", "noida", "gautam buddha nagar"]
 */
export function expandLocationAliases(text: string): string[] {
  const lower = text.toLowerCase().trim();
  const set = new Set<string>();
  set.add(lower);

  // Split tokens if comma/slash separated
  lower.split(/[,/]+/).forEach((part) => {
    const trimmed = part.trim();
    if (trimmed) set.add(trimmed);
  });

  if (
    lower.includes("noida extension") ||
    lower.includes("greater noida west") ||
    lower.includes("gr noida west") ||
    lower.includes("gaur city") ||
    lower.includes("crossing republik") ||
    lower.includes("crossings republik")
  ) {
    set.add("noida extension");
    set.add("greater noida west");
    set.add("greater noida");
    set.add("gr noida");
    set.add("noida");
    set.add("gautam buddha nagar");
    set.add("gautam budh nagar");
  } else if (
    lower.includes("greater noida") ||
    lower.includes("gr noida") ||
    lower.includes("pari chowk") ||
    lower.includes("knowledge park")
  ) {
    set.add("greater noida");
    set.add("gr noida");
    set.add("noida");
    set.add("gautam buddha nagar");
  } else if (lower.includes("noida")) {
    set.add("noida");
    set.add("gautam buddha nagar");
  }

  if (
    lower.includes("indirapuram") ||
    lower.includes("vaishali") ||
    lower.includes("vasundhara") ||
    lower.includes("kaushambi") ||
    lower.includes("raj nagar") ||
    lower.includes("sahibabad") ||
    lower.includes("ghaziabad")
  ) {
    set.add("ghaziabad");
  }

  if (
    lower.includes("delhi") ||
    lower.includes("dwarka") ||
    lower.includes("rohini") ||
    lower.includes("saket") ||
    lower.includes("janakpuri") ||
    lower.includes("lajpat nagar") ||
    lower.includes("karol bagh") ||
    lower.includes("connaught place") ||
    lower.includes("laxmi nagar")
  ) {
    set.add("delhi");
    set.add("new delhi");
  }

  if (
    lower.includes("gurgaon") ||
    lower.includes("gurugram") ||
    lower.includes("cyber city") ||
    lower.includes("sohna") ||
    lower.includes("dlf") ||
    lower.includes("golf course")
  ) {
    set.add("gurgaon");
    set.add("gurugram");
  }

  if (
    lower.includes("faridabad") ||
    lower.includes("ballabhgarh") ||
    lower.includes("nit faridabad")
  ) {
    set.add("faridabad");
  }

  return Array.from(set);
}

/**
 * Determines whether a category is available in the selected location.
 * Category zones are stored as comma-separated city, locality, or area names (e.g. "Noida, Greater Noida, Delhi, Bharthana").
 */
export function isCategoryAvailableAtLocation(
  zonesLocation: string | null | undefined,
  cityName?: string | null,
  address?: string | null,
  fullAddress?: string | null
): boolean {
  // If no specific zone restrictions set on category, allow by default
  if (!zonesLocation || !zonesLocation.trim()) return true;

  const rawZones = zonesLocation
    .split(",")
    .map((zone) => zone.trim().toLowerCase())
    .filter((zone) => zone.length > 0);

  // If "all" or "all areas" or "india" is present
  if (rawZones.some((z) => z === "all" || z === "all areas" || z === "all cities" || z === "pan india" || z === "india")) {
    return true;
  }

  // Combined search text of user's current location
  const combinedText = `${cityName || ""} ${address || ""} ${fullAddress || ""}`.toLowerCase().trim();

  if (!combinedText) return true;

  const locationTokens = expandLocationAliases(combinedText);

  // Check if any defined zone is inside user's location tokens OR user location token matches zone
  return rawZones.some((zone) => {
    return locationTokens.some((tok) => {
      return (
        tok === zone ||
        tok.includes(zone) ||
        zone.includes(tok)
      );
    });
  });
}

