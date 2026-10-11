const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  AE: "United Arab Emirates",
  SG: "Singapore",
  NP: "Nepal",
  BD: "Bangladesh",
  PK: "Pakistan",
  LK: "Sri Lanka",
};

export type IpinfoLocation = {
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
  latitude: number;
  longitude: number;
};

function countryName(codeOrName: string | undefined): string {
  if (!codeOrName) return "India";
  const upper = codeOrName.toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];
  if (codeOrName.length === 2) return codeOrName;
  return codeOrName;
}

function parseLoc(loc: unknown): { latitude: number; longitude: number } {
  if (typeof loc !== "string" || !loc.includes(",")) {
    return { latitude: 0, longitude: 0 };
  }
  const [lat, lon] = loc.split(",").map((n) => Number(n.trim()));
  return {
    latitude: Number.isFinite(lat) ? lat : 0,
    longitude: Number.isFinite(lon) ? lon : 0,
  };
}

function mapIpinfoPayload(data: Record<string, any>): IpinfoLocation | null {
  const city =
    data.city ||
    data.location?.city ||
    data.geo?.city ||
    "";
  const state =
    data.region ||
    data.region_name ||
    data.location?.region ||
    data.geo?.region ||
    "";
  const country = countryName(
    data.country_name ||
      data.country ||
      data.country_code ||
      data.location?.country ||
      data.geo?.country
  );
  const postalCode = data.postal || data.postal_code || data.location?.postal || "";
  const { latitude, longitude } = parseLoc(data.loc || data.location?.loc);

  if (!city && !state) return null;

  const cityOrArea = city || state || "Local Area";
  const fullAddress = [cityOrArea, state, country].filter(Boolean).join(", ");

  return {
    address: fullAddress,
    shortAddress: cityOrArea,
    fullAddress,
    houseNumber: "",
    street: "",
    sector: "",
    mohalla: cityOrArea,
    city: cityOrArea,
    state,
    country,
    postalCode,
    latitude,
    longitude,
  };
}

export function isPrivateOrLocalIp(ip: string | null | undefined): boolean {
  if (!ip) return true;
  const value = ip.replace(/^::ffff:/, "").trim();
  if (!value || value === "127.0.0.1" || value === "::1" || value === "localhost") {
    return true;
  }
  if (value.startsWith("10.")) return true;
  if (value.startsWith("192.168.")) return true;
  if (value.startsWith("169.254.")) return true;
  const m = value.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

export function clientIpFromRequest(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  const cf = headers.get("cf-connecting-ip")?.trim();
  const ip = cf || forwarded || real || null;
  if (!ip || isPrivateOrLocalIp(ip)) return null;
  return ip.replace(/^::ffff:/, "");
}

function ipinfoQueryToken(raw: string | undefined): string | null {
  const token = raw?.trim();
  if (!token) return null;
  // IPinfo access tokens are short alphanumeric keys. A Tyk/base64 key
  // sent as ?token= is rejected as "Unknown token" and breaks lookup.
  if (token.startsWith("eyJ") || token.includes("{") || token.length > 40) {
    return null;
  }
  return token;
}

export async function lookupIpinfoLocation(ip: string | null): Promise<IpinfoLocation | null> {
  const path = ip ? `https://ipinfo.io/${encodeURIComponent(ip)}/json` : "https://ipinfo.io/json";
  const token = ipinfoQueryToken(process.env.IPINFO_TOKEN);
  const url = token ? `${path}?token=${encodeURIComponent(token)}` : path;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`IPinfo lookup failed (${res.status})`);
  }

  const data = await res.json();
  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : data.error?.title || "IPinfo error");
  }

  return mapIpinfoPayload(data);
}
