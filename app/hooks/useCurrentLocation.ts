import { useState, useEffect } from "react";
import { getCurrentLocation } from "@/lib/location";

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  name: string;
};

type UseCurrentLocationResult = {
  location: LocationData | null;
  loading: boolean;
  error: Error | null;
};

export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        setLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          name: loc.address || loc.city || "Unknown location",
        });
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  return { location, loading, error };
};
