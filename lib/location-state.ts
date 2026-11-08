export interface ConfirmedLocation {
  isConfirmed: boolean;
  address: string;
  shortAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  zoneId?: number | null;
  zoneName?: string | null;
  isServiceable: boolean;
  allowedCategoryIds: number[];
  confirmedAt: number;
}

const STORAGE_KEY = "omaa_confirmed_location";
const USER_LOC_KEY = "user_location";

/**
 * Returns the currently confirmed location from localStorage (client-side only).
 */
export function getConfirmedLocation(): ConfirmedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy user_location if it has isConfirmed flag or existing location data
      const legacyRaw = localStorage.getItem(USER_LOC_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (parsed && (parsed.isConfirmed || parsed.city || parsed.address || parsed.shortAddress)) {
          return {
            isConfirmed: true,
            address: parsed.fullAddress || parsed.address || parsed.city || "",
            shortAddress: parsed.shortAddress || parsed.city || "My Location",
            city: parsed.city || "Delhi NCR",
            state: parsed.state || "",
            postalCode: parsed.postalCode || "",
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            zoneId: parsed.zoneId || null,
            zoneName: parsed.zoneName || "Doorstep Service Area",
            isServiceable: true,
            allowedCategoryIds: Array.isArray(parsed.allowedCategoryIds) && parsed.allowedCategoryIds.length > 0
              ? parsed.allowedCategoryIds
              : [1, 2, 3, 4, 5, 6, 7],
            confirmedAt: Date.now(),
          };
        }
      }
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isConfirmed) {
      if (!Array.isArray(parsed.allowedCategoryIds)) {
        parsed.allowedCategoryIds = [];
      }
      parsed.isServiceable = parsed.allowedCategoryIds.length > 0;
      return parsed as ConfirmedLocation;
    }
  } catch (err) {
    console.error("Error reading confirmed location:", err);
  }
  return null;
}

/**
 * Saves the confirmed location in localStorage and syncs with user_location for backward compatibility.
 * Dispatches 'location_confirmed' and 'location_changed' events across the window.
 */
export function setConfirmedLocation(data: Omit<ConfirmedLocation, "confirmedAt">): ConfirmedLocation {
  const confirmed: ConfirmedLocation = {
    ...data,
    isConfirmed: true,
    confirmedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(confirmed));
      
      // Also sync to legacy user_location so existing cart/booking flows keep working seamlessly
      const legacyFormat = {
        latitude: confirmed.latitude,
        longitude: confirmed.longitude,
        address: confirmed.address,
        fullAddress: confirmed.address,
        shortAddress: confirmed.shortAddress,
        city: confirmed.city,
        state: confirmed.state || "",
        country: "India",
        postalCode: confirmed.postalCode || "",
        isConfirmed: true,
        zoneId: confirmed.zoneId,
        zoneName: confirmed.zoneName,
        isServiceable: confirmed.isServiceable,
        allowedCategoryIds: confirmed.allowedCategoryIds,
      };
      localStorage.setItem(USER_LOC_KEY, JSON.stringify(legacyFormat));

      // Dispatch custom events
      window.dispatchEvent(new CustomEvent("location_confirmed", { detail: confirmed }));
      window.dispatchEvent(new Event("location_changed"));
    } catch (err) {
      console.error("Error saving confirmed location:", err);
    }
  }

  return confirmed;
}

/**
 * Clears the confirmed location.
 */
export function clearConfirmedLocation(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const legacy = localStorage.getItem(USER_LOC_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        delete parsed.isConfirmed;
        localStorage.setItem(USER_LOC_KEY, JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event("location_changed"));
    } catch (err) {
      console.error("Error clearing confirmed location:", err);
    }
  }
}

/**
 * Triggers the Location Confirmation modal from anywhere in the app.
 */
export function openLocationModal(source?: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open_location_modal", { detail: { source } }));
  }
}

