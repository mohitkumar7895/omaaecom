import { formatOsmPlace, type ResolvedAddress } from "@/lib/reverse-geocode";

export function googleMapsKey(): string {
  return (process.env.GOOGLE_MAPS_API_KEY || "").trim();
}

function component(
  components: Array<{
    long_name?: string;
    longText?: string;
    short_name?: string;
    shortText?: string;
    types?: string[];
  }> | undefined,
  types: string[]
): string {
  const match = (components || []).find((c) => (c.types || []).some((t) => types.includes(t)));
  return match?.long_name || match?.longText || "";
}

function readLatLng(loc: any): { lat?: number; lng?: number } {
  if (!loc) return {};
  const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat ?? loc.latitude;
  const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng ?? loc.longitude;
  return { lat: lat == null ? undefined : Number(lat), lng: lng == null ? undefined : Number(lng) };
}

export function formatGoogleGeocodeResult(
  result: any,
  gps?: { latitude: number; longitude: number }
): ResolvedAddress | null {
  if (!result) return null;
  const parts = result.address_components || result.addressComponents || [];
  const { lat, lng } = readLatLng(result.geometry?.location || result.location);
  const display =
    result.formatted_address ||
    result.formattedAddress ||
    result.displayName?.text ||
    result.displayName ||
    result.name ||
    "";

  const latitude = gps?.latitude ?? lat;
  const longitude = gps?.longitude ?? lng;
  const buildingName = String(result.displayName?.text || result.displayName || result.name || "").trim();
  const isPlusCode = /^\w{4,8}\+[a-z0-9]+/i.test(buildingName) || /^\w{4,8}\+[a-z0-9]+/i.test(display);

  return formatOsmPlace(
    {
      display_name: display,
      address: {
        house_number:
          component(parts, ["street_number"]) ||
          component(parts, ["premise"]) ||
          component(parts, ["subpremise"]),
        name: isPlusCode ? "" : buildingName,
        road: component(parts, ["route"]),
        neighbourhood: component(parts, ["neighborhood", "sublocality_level_2", "sublocality_level_3"]),
        suburb: component(parts, ["sublocality_level_1", "sublocality", "neighborhood"]),
        village: component(parts, ["administrative_area_level_3"]),
        city: component(parts, ["locality"]),
        town: component(parts, ["postal_town"]),
        municipality: component(parts, ["administrative_area_level_3"]),
        state: component(parts, ["administrative_area_level_1"]),
        state_district: component(parts, ["administrative_area_level_2"]),
        postcode: component(parts, ["postal_code"]),
        country: component(parts, ["country"]),
      },
      lat: latitude,
      lon: longitude,
    },
    Number.isFinite(Number(latitude))
      ? { latitude: Number(latitude), longitude: Number(longitude) }
      : undefined
  );
}

function metersBetween(
  a: { latitude: number; longitude: number },
  b: { latitude?: number; longitude?: number }
): number {
  if (!Number.isFinite(b.latitude) || !Number.isFinite(b.longitude)) return Number.POSITIVE_INFINITY;
  const R = 6371000;
  const dLat = ((b.latitude! - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude! - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude! * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function fromGooglePlace(
  result: any,
  gps: { latitude: number; longitude: number },
  maxMeters = 2500
): ResolvedAddress | null {
  const { lat, lng } = readLatLng(result?.geometry?.location || result?.location);
  if (Number.isFinite(lat) && Number.isFinite(lng) && metersBetween(gps, { latitude: lat, longitude: lng }) > maxMeters) {
    return null;
  }
  return formatGoogleGeocodeResult(result, gps);
}

function mapsHeaders(key: string, fieldMask?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key,
  };
  if (fieldMask) headers["X-Goog-FieldMask"] = fieldMask;
  return headers;
}

async function googleFetch(url: string, init?: RequestInit): Promise<any | null> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    ...init,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message || data?.error_message || res.statusText;
    console.warn("Google Maps HTTP", res.status, message);
    return null;
  }
  return data;
}

function typeRank(r: any): number {
  const t = r.types || [];
  if (t.includes("street_address") || t.includes("premise") || t.includes("subpremise")) return 0;
  if (t.includes("route")) return 1;
  if (t.includes("establishment") || t.includes("point_of_interest")) return 2;
  if (
    t.includes("neighborhood") ||
    t.includes("sublocality") ||
    t.includes("sublocality_level_1") ||
    t.includes("sublocality_level_2")
  ) {
    return 3;
  }
  if (t.includes("plus_code")) return 7;
  if (t.includes("locality") || t.includes("administrative_area_level_2")) return 5;
  return 4;
}

function locationTypeRank(r: any): number {
  const lt = r.geometry?.location_type || r.locationType;
  if (lt === "ROOFTOP") return 0;
  if (lt === "RANGE_INTERPOLATED") return 1;
  if (lt === "GEOMETRIC_CENTER") return 2;
  return 3;
}

function pickFinestGoogleResult(results: any[]): any | null {
  if (!Array.isArray(results) || !results.length) return null;
  return [...results].sort((a, b) => {
    const loc = locationTypeRank(a) - locationTypeRank(b);
    if (loc) return loc;
    return typeRank(a) - typeRank(b);
  })[0];
}

function mergeGoogleComponents(results: any[], primary: any) {
  const components: any[] = [];
  const seen = new Set<string>();
  for (const r of [primary, ...results.filter((item) => item !== primary)]) {
    for (const c of r.address_components || r.addressComponents || []) {
      const key = [...(c.types || [])].sort().join("|");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      components.push(c);
    }
  }
  return {
    ...primary,
    address_components: components.length ? components : primary.address_components,
    addressComponents: components.length ? components : primary.addressComponents,
  };
}

/** Open Location Code (plus code) so Places API (New) can reverse a GPS point. */
function encodePlusCode(latitude: number, longitude: number): string {
  const chars = "23456789CFGHJMPQRVWX";
  let lat = Math.min(90 - 1e-10, Math.max(-90, latitude)) + 90;
  let lng = ((longitude + 180) % 360 + 360) % 360;
  const pairSizes = [20, 1, 0.05, 0.0025, 0.000125];
  let code = "";
  for (let i = 0; i < 5; i++) {
    const size = pairSizes[i];
    const latDigit = Math.min(19, Math.floor(lat / size));
    const lngDigit = Math.min(19, Math.floor(lng / size));
    lat -= latDigit * size;
    lng -= lngDigit * size;
    code += chars[latDigit] + chars[lngDigit];
    if (i === 3) code += "+";
  }
  const row = Math.min(4, Math.floor(lat / 0.000025));
  const col = Math.min(3, Math.floor(lng / 0.00003125));
  return code + chars[row * 4 + col];
}

async function reverseViaGeocodingJson(key: string, latitude: number, longitude: number) {
  const gps = { latitude, longitude };
  const base = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&region=in&key=${encodeURIComponent(key)}`;
  const preciseUrl = `${base}&result_type=${encodeURIComponent("street_address|premise|subpremise|route")}`;

  const precise = await googleFetch(preciseUrl);
  const all =
    precise?.status === "OK" && precise.results?.length
      ? precise
      : await googleFetch(base);

  if (!all) return null;
  if (all.status !== "OK" || !all.results?.length) {
    if (all.status && all.status !== "OK") {
      console.warn("Google Geocoding:", all.status, all.error_message || "");
    }
    return null;
  }
  const finest = pickFinestGoogleResult(all.results);
  if (!finest) return null;
  return fromGooglePlace(mergeGoogleComponents(all.results, finest), gps, 400);
}

async function reverseViaPlacesSearchText(key: string, latitude: number, longitude: number) {
  const gps = { latitude, longitude };
  const queries = [encodePlusCode(latitude, longitude)];
  for (const textQuery of queries) {
    const data = await googleFetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: mapsHeaders(
        key,
        "places.formattedAddress,places.addressComponents,places.location,places.displayName,places.types"
      ),
      body: JSON.stringify({
        textQuery,
        languageCode: "en",
        regionCode: "IN",
        maxResultCount: 5,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 250,
          },
        },
      }),
    });
    const places = data?.places || [];
    for (const place of places) {
      const formatted = fromGooglePlace(place, gps);
      if (formatted?.shortAddress) return formatted;
    }
  }
  return null;
}

async function reverseViaGeocodingV4(key: string, latitude: number, longitude: number) {
  const url = `https://geocode.googleapis.com/v4beta/geocode/location/${latitude},${longitude}?languageCode=en&regionCode=IN`;
  const data = await googleFetch(url, { headers: mapsHeaders(key) });
  const result = data?.results?.[0] || data?.result;
  return result ? fromGooglePlace(result, { latitude, longitude }) : null;
}

async function reverseViaPlacesNearby(key: string, latitude: number, longitude: number) {
  const gps = { latitude, longitude };
  for (const type of ["point_of_interest", "premise", "street_address", "sublocality", "neighborhood"]) {
    const data = await googleFetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: mapsHeaders(
        key,
        "places.formattedAddress,places.addressComponents,places.location,places.displayName,places.types"
      ),
      body: JSON.stringify({
        maxResultCount: 5,
        rankPreference: "DISTANCE",
        languageCode: "en",
        regionCode: "IN",
        includedTypes: [type],
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 80,
          },
        },
      }),
    });
    for (const place of data?.places || []) {
      const formatted = fromGooglePlace(place, gps, 80);
      if (formatted?.shortAddress) return formatted;
    }
  }
  return null;
}

async function reverseViaPlacesAutocomplete(key: string, latitude: number, longitude: number) {
  const auto = await googleFetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: mapsHeaders(key, "suggestions.placePrediction.placeId"),
    body: JSON.stringify({
      input: encodePlusCode(latitude, longitude),
      includedRegionCodes: ["IN"],
      languageCode: "en",
      regionCode: "IN",
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: 150,
        },
      },
    }),
  });
  const placeId = auto?.suggestions?.[0]?.placePrediction?.placeId;
  if (!placeId) return null;
  const place = await googleFetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=IN`,
    {
      headers: mapsHeaders(key, "id,formattedAddress,addressComponents,location,displayName"),
    }
  );
  return place ? fromGooglePlace(place, { latitude, longitude }) : null;
}

function exactness(loc: ResolvedAddress | null): number {
  if (!loc?.shortAddress) return -1;
  let score = 0;
  if (loc.houseNumber) score += 5;
  if (loc.street) score += 4;
  if (loc.sector) score += 3;
  if (loc.mohalla) score += 2;
  if (loc.city) score += 1;
  return score;
}

export async function googleReverseGeocode(
  latitude: number,
  longitude: number
): Promise<ResolvedAddress | null> {
  const key = googleMapsKey();
  if (!key) return null;

  const [fromJson, fromNearby] = await Promise.all([
    reverseViaGeocodingJson(key, latitude, longitude),
    reverseViaPlacesNearby(key, latitude, longitude),
  ]);

  const bestOfPair = exactness(fromNearby) > exactness(fromJson) ? fromNearby : fromJson;
  if (bestOfPair && exactness(bestOfPair) >= 4) return bestOfPair;

  const fromText = await reverseViaPlacesSearchText(key, latitude, longitude);
  const fromV4 = await reverseViaGeocodingV4(key, latitude, longitude);
  const fromAuto = await reverseViaPlacesAutocomplete(key, latitude, longitude);

  return [bestOfPair, fromText, fromV4, fromAuto].sort((a, b) => exactness(b) - exactness(a))[0] || null;
}

async function searchViaPlacesNew(key: string, query: string): Promise<ResolvedAddress[]> {
  const auto = await googleFetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: mapsHeaders(key, "suggestions.placePrediction.placeId,suggestions.placePrediction.text"),
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ["IN"],
      languageCode: "en",
      regionCode: "IN",
    }),
  });

  const predictions = (auto?.suggestions || [])
    .map((s: any) => s?.placePrediction)
    .filter((p: any) => p?.placeId)
    .slice(0, 6);

  if (!predictions.length) return [];

  const detailed = await Promise.all(
    predictions.map(async (pred: { placeId: string }) => {
      const place = await googleFetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(pred.placeId)}?languageCode=en&regionCode=IN`,
        {
          headers: mapsHeaders(
            key,
            "id,formattedAddress,addressComponents,location,displayName"
          ),
        }
      );
      return place ? formatGoogleGeocodeResult(place) : null;
    })
  );

  return detailed.filter(Boolean) as ResolvedAddress[];
}

async function searchViaGeocoding(key: string, query: string): Promise<ResolvedAddress[]> {
  const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=in&components=country:IN&language=en&key=${encodeURIComponent(key)}`;
  const geoData = await googleFetch(geoUrl);
  if (!geoData) return [];
  if (geoData.status !== "OK" || !Array.isArray(geoData.results)) {
    if (geoData.status && geoData.status !== "OK" && geoData.status !== "ZERO_RESULTS") {
      console.warn("Google Geocoding search:", geoData.status, geoData.error_message || "");
    }
    return [];
  }
  return geoData.results
    .slice(0, 8)
    .map((item: any) => formatGoogleGeocodeResult(item))
    .filter(Boolean) as ResolvedAddress[];
}

export async function googleSearchPlaces(query: string): Promise<ResolvedAddress[]> {
  const key = googleMapsKey();
  if (!key) return [];

  const fromNew = await searchViaPlacesNew(key, query);
  if (fromNew.length) return fromNew;

  return searchViaGeocoding(key, query);
}
