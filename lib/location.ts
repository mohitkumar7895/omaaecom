/**
 * Gets the user's high-accuracy GPS coordinates and reverse-geocodes them
 * via our secure backend geocoding endpoint (supporting Google Maps API & fallbacks).
 */
export const getCurrentLocation = async (): Promise<{
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
}> => {
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

  return {
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
};
