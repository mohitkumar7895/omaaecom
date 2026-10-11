export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  shortAddress: string;
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
  return {
    latitude: coords?.latitude || loc.latitude || 0,
    longitude: coords?.longitude || loc.longitude || 0,
    accuracy: coords?.accuracy || 0,
    address: loc.fullAddress || loc.shortAddress || loc.address || "",
    shortAddress: loc.shortAddress || loc.fullAddress || loc.address || loc.city || "",
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

function gpsErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission denied. Please allow location access in your browser settings.";
    case err.POSITION_UNAVAILABLE:
      return "GPS location details are unavailable. Please type your address manually.";
    case err.TIMEOUT:
      return "The request to get your GPS location timed out. Please try again.";
    default:
      return "Failed to fetch GPS coordinates. Please enter manually.";
  }
}

/** Watch GPS until accuracy is tight, instead of one coarse Wi‑Fi ping. */
function readBestGps(maxWaitMs = 12000, goodAccuracyM = 35): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    let best: GeolocationPosition | null = null;
    let settled = false;

    const finish = (pos: GeolocationPosition | null, err?: Error) => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (pos) resolve(pos);
      else reject(err || new Error("Failed to fetch GPS coordinates. Please enter manually."));
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
        if (pos.coords.accuracy <= goodAccuracyM) finish(pos);
      },
      (err) => {
        if (best) finish(best);
        else finish(null, new Error(gpsErrorMessage(err)));
      },
      { enableHighAccuracy: true, timeout: maxWaitMs, maximumAge: 0 }
    );

    const timer = setTimeout(() => {
      if (best) finish(best);
      else finish(null, new Error("The request to get your GPS location timed out. Please try again."));
    }, maxWaitMs);
  });
}

export const getCurrentLocation = async (): Promise<ResolvedLocation> => {
  const position = await readBestGps(14000, 30);
  const { latitude, longitude, accuracy } = position.coords;
  const loc = await geocodeOnServer({ latitude, longitude });
  return mapGeocodePayload(loc, { latitude, longitude, accuracy });
};

export const autoDetectLocation = async (): Promise<ResolvedLocation | null> => {
  try {
    let coords: { latitude: number; longitude: number; accuracy?: number } | null = null;

    try {
      const position = await readBestGps(12000, 35);
      coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch {
      console.info("GPS unavailable, using network IP location.");
    }

    const loc = await geocodeOnServer(coords || {});
    const result = mapGeocodePayload(loc, coords || undefined);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("user_location", JSON.stringify(result));
        window.dispatchEvent(new Event("location_changed"));
      } catch {}
    }

    return result;
  } catch (err) {
    console.error("Auto detect location failed:", err);
  }

  return null;
};
