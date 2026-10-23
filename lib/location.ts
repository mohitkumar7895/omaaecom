export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  shortAddress: string;
  fullAddress?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  sector: string;
  mohalla: string;
  houseNumber: string;
  street: string;
}

function mapGeocodePayload(
  loc: any,
  coords?: { latitude: number; longitude: number; accuracy?: number }
): ResolvedLocation {
  const full = loc.fullAddress || loc.display_name || loc.address || loc.shortAddress || "";
  return {
    latitude: coords?.latitude || loc.latitude || 0,
    longitude: coords?.longitude || loc.longitude || 0,
    accuracy: coords?.accuracy || 0,
    address: full || loc.shortAddress || "",
    shortAddress: loc.shortAddress || full || loc.city || "",
    fullAddress: full,
    city: loc.city || "",
    state: loc.state || "",
    country: loc.country || "",
    postalCode: loc.postalCode || "",
    sector: loc.sector || "",
    mohalla: loc.mohalla || "",
    houseNumber: loc.houseNumber || "",
    street: loc.street || "",
  };
}

async function geocodeOnServer(
  payload: Record<string, unknown>
): Promise<ResolvedLocation> {
  const response = await fetch("/api/location/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    let errorMsg = data.error || "Unable to get location name";
    if (errorMsg.includes("Unable to resolve location")) {
      errorMsg = "Address not found. Please type your location manually.";
    }
    throw new Error(errorMsg);
  }

  return mapGeocodePayload(data.data);
}

async function gpsAllowed(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" });
    if (status?.state === "denied") return false;
  } catch {
    // Safari / older browsers: still try getCurrentPosition
  }
  return true;
}

function readGps(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, (err) => reject(err), options);
  });
}

async function detectFromGpsOrIp(): Promise<ResolvedLocation> {
  let coords: { latitude: number; longitude: number; accuracy?: number } | undefined;

  if (await gpsAllowed()) {
    try {
      const position = await readGps({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60_000,
      });
      coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch {
      // Permission denied / timeout: fall back to IP like before
    }
  }

  const loc = await geocodeOnServer(coords || {});
  return mapGeocodePayload(loc, coords);
}

export const getCurrentLocation = async (): Promise<ResolvedLocation> => {
  return detectFromGpsOrIp();
};

export const autoDetectLocation = async (): Promise<ResolvedLocation | null> => {
  try {
    return await detectFromGpsOrIp();
  } catch (err) {
    console.error("Auto detect location failed:", err);
    return null;
  }
};
