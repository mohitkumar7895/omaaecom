export type ResolvedAddress = {
  address: string;
  shortAddress: string;
  fullAddress: string;
  houseNumber: string;
  street: string;
  sector: string;
  mohalla: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
};

const PIN = /^\d{6}$/;
const STATE_OR_COUNTRY =
  /^(india|भारत|uttar pradesh|madhya pradesh|himachal pradesh|andhra pradesh|arunachal pradesh|west bengal|tamil nadu|karnataka|kerala|maharashtra|gujarat|rajasthan|bihar|jharkhand|odisha|punjab|haryana|assam|goa|delhi nct)$/i;
const SKIP_PARENT =
  /^(dadri|dadri tehsil|gautam buddha nagar|gautam buddh nagar|national capital region|ncr|tehsil|.+\sdivision)$/i;

function clean(value: unknown): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniq(parts: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of parts) {
    const value = clean(raw);
    if (!value || PIN.test(value) || STATE_OR_COUNTRY.test(value) || SKIP_PARENT.test(value)) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function asSector(value: string): string {
  const match = value.match(/\b(?:sector|sec\.?)\s*-?\s*\d+[a-z]?\b/i);
  if (!match) return "";
  return match[0].replace(/\bsec\.?\b/i, "Sector").replace(/\s+/g, " ");
}

function asBlock(text: string): string {
  const match = text.match(/\b(?:block|blk)\s*[-.]?\s*[a-z0-9]+\b/i);
  if (!match) return "";
  return match[0].replace(/\bblk\b/i, "Block").replace(/^(block)/i, "Block");
}

function pickCity(address: Record<string, any>): string {
  for (const key of ["city", "town", "municipality"]) {
    const value = clean(address[key]);
    if (value && !SKIP_PARENT.test(value) && !STATE_OR_COUNTRY.test(value)) return value;
  }
  return "";
}

function pickArea(address: Record<string, any>, sector: string): string {
  const sectorKey = sector.toLowerCase();
  const fields = [
    address.neighbourhood,
    address.suburb,
    address.residential,
    address.quarter,
    address.village,
    address.hamlet,
    address.city_district,
    address.ward,
  ];
  for (const field of fields) {
    const value = clean(field);
    if (!value) continue;
    if (sector && value.toLowerCase() === sectorKey) continue;
    if (asSector(value)) continue;
    if (SKIP_PARENT.test(value)) continue;
    return value;
  }
  return "";
}

function pickParent(address: Record<string, any>, already: string[]): string {
  const taken = new Set(already.map((n) => n.toLowerCase()));
  for (const key of ["state_district", "county"]) {
    const value = clean(address[key]).replace(/\s+district$/i, "");
    if (!value || SKIP_PARENT.test(value) || taken.has(value.toLowerCase())) continue;
    return value;
  }
  return "";
}

/** Indian spoken address: Block / Road / Sector / Area / City / District */
export function formatOsmPlace(
  data: { display_name?: string; address?: Record<string, any>; lat?: unknown; lon?: unknown },
  coords?: { latitude: number; longitude: number }
): ResolvedAddress | null {
  const address = data.address || {};
  const display = clean(data.display_name);
  if (!display && !Object.keys(address).length) return null;

  const houseNumber = clean(address.house_number);
  const streetRaw = clean(address.road || address.pedestrian || address.street || address.path || address.lane);
  const street = /^unnamed\b/i.test(streetRaw) ? "" : streetRaw;
  const blob = [display, ...Object.values(address)].join(" ");
  const sector = asSector(clean(address.suburb)) || asSector(clean(address.neighbourhood)) || asSector(blob);
  const block = asBlock(clean(address.block)) || asBlock(blob);
  const building = clean(address.name);
  const area = pickArea(address, sector);
  const city = pickCity(address);
  const townLike = city || clean(address.village) || clean(address.town);
  const spokenCore = uniq([
    houseNumber,
    block,
    building && building !== street && building !== townLike ? building : "",
    street,
    sector,
    area,
    townLike && townLike !== area ? townLike : "",
  ]);
  const parent = pickParent(address, spokenCore);
  const spoken = uniq([...spokenCore, parent]);

  const shortAddress = spoken.join(", ") || city || area || "Local Area";
  const state = clean(address.state);
  const postalCode = clean(address.postcode);
  const fullAddress = uniq([houseNumber, ...spoken, state, postalCode]).join(", ") || shortAddress;

  const latitude =
    coords?.latitude ?? (data.lat != null ? Number(data.lat) : undefined);
  const longitude =
    coords?.longitude ?? (data.lon != null ? Number(data.lon) : undefined);

  return {
    address: shortAddress,
    shortAddress,
    fullAddress,
    houseNumber,
    street,
    sector,
    mohalla: area,
    city: city || area || parent || "Local Area",
    state,
    country: clean(address.country) || "India",
    postalCode,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  };
}

function mergeOsm(primary: any, extra: any): any {
  if (!primary) return extra;
  if (!extra) return primary;
  const a = { ...(extra.address || {}), ...(primary.address || {}) };
  return {
    ...extra,
    ...primary,
    address: a,
    display_name: primary.display_name || extra.display_name,
  };
}

async function fetchOsm(latitude: number, longitude: number, zoom: number) {
  const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=${zoom}&addressdetails=1`;
  const res = await fetch(osmUrl, {
    headers: {
      "User-Agent": "OmaaEcomApp/4.0 (contact@omaacompany.com)",
      Accept: "application/json",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function reverseGeocodeCoords(
  latitude: number,
  longitude: number
): Promise<ResolvedAddress | null> {
  try {
    const { googleReverseGeocode } = await import("./google-maps");
    const google = await googleReverseGeocode(latitude, longitude);
    if (google?.shortAddress) return google;
  } catch (e) {
    console.warn("Google reverse geocode failed:", e);
  }

  const [zoom18, zoom16] = await Promise.allSettled([
    fetchOsm(latitude, longitude, 18),
    fetchOsm(latitude, longitude, 16),
  ]);

  const a = zoom18.status === "fulfilled" ? zoom18.value : null;
  const b = zoom16.status === "fulfilled" ? zoom16.value : null;
  const merged = mergeOsm(a, b);
  const place = merged ? formatOsmPlace(merged, { latitude, longitude }) : null;
  if (place?.shortAddress) return place;
  return null;
}
