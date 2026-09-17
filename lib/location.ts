export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mohalla: string;
  houseNumber: string;
  street: string;
}

/**
 * Gets the user's high-accuracy GPS coordinates and reverse-geocodes them
 * via our secure backend geocoding endpoint (supporting Google Maps API & fallbacks).
 */
export const getCurrentLocation = async (): Promise<ResolvedLocation> => {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please allow location access in your browser settings."));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error("GPS location details are unavailable. Please type your address manually."));
            break;
          case err.TIMEOUT:
            reject(new Error("The request to get your GPS location timed out. Please try again."));
            break;
          default:
            reject(new Error("Failed to fetch GPS coordinates. Please enter manually."));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

  const { latitude, longitude, accuracy } = position.coords;

  // Secure backend geocoding call
  const response = await fetch("/api/location/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    let errorMsg = data.error || "Unable to get location name";
    if (errorMsg.includes("API Key is not configured")) {
      errorMsg = "Location service configuration error (API Key is missing). Please verify .env settings.";
    } else if (errorMsg.includes("REQUEST_DENIED")) {
      errorMsg = "Google Geocoding API request denied. Please ensure Billing is enabled on your Google Cloud Project.";
    } else if (errorMsg.includes("Unable to resolve location")) {
      errorMsg = "Address not found. Please type your location manually.";
    }
    throw new Error(errorMsg);
  }

  const loc = data.data;

  const result: ResolvedLocation = {
    latitude,
    longitude,
    accuracy: accuracy || 0,
    address: loc.address || loc.fullAddress || "",
    city: loc.city || "",
    state: loc.state || "",
    country: loc.country || "",
    postalCode: loc.postalCode || "",
    mohalla: loc.mohalla || "",
    houseNumber: loc.houseNumber || "",
    street: loc.street || "",
  };

  return result;
};

/**
 * Automatically detects user location on website launch:
 * 1. Tries high accuracy browser GPS (with a 8s timeout).
 * 2. If granted -> reverse geocodes coordinates.
 * 3. If denied or timed out -> falls back seamlessly to IP-based location auto-detection.
 * 4. Saves to localStorage and dispatches "location_changed" event.
 */
export const autoDetectLocation = async (): Promise<ResolvedLocation | null> => {
  try {
    // 1. Try browser GPS first if supported
    let coords: { latitude: number; longitude: number; accuracy?: number } | null = null;

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000, // 5 min cache
          });
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      } catch (geoErr) {
        // Geolocation denied or timed out, will fall back to IP
        console.info("GPS geolocation skipped or timed out, falling back to network IP location.", geoErr);
      }
    }

    // 2. Fetch geocode data from backend (with coordinates if available, or empty for IP resolution)
    const payload = coords ? { latitude: coords.latitude, longitude: coords.longitude } : {};
    const res = await fetch("/api/location/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const loc = data.data;
      const result: ResolvedLocation = {
        latitude: coords?.latitude || loc.latitude || 0,
        longitude: coords?.longitude || loc.longitude || 0,
        accuracy: coords?.accuracy || 0,
        address: loc.address || loc.fullAddress || "",
        city: loc.city || "",
        state: loc.state || "",
        country: loc.country || "",
        postalCode: loc.postalCode || "",
        mohalla: loc.mohalla || "",
        houseNumber: loc.houseNumber || "",
        street: loc.street || "",
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user_location", JSON.stringify(result));
          window.dispatchEvent(new Event("location_changed"));
        } catch (e) {}
      }

      return result;
    }
  } catch (err) {
    console.error("Auto detect location failed:", err);
  }

  return null;
};

