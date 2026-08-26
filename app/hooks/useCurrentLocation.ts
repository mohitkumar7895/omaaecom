import { useState, useEffect } from "react";

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

/**
 * Hook to retrieve the user's current geographical location and a readable name.
 * It uses the browser's Geolocation API and OpenStreetMap's Nominatim service.
 * Returns the location data, a loading flag, and any error encountered.
 */
export const useCurrentLocation = (): UseCurrentLocationResult => {
 const [location, setLocation] = useState<LocationData | null>(null);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<Error | null>(null);

 useEffect(() => {
 const fetchLocation = async () => {
 try {
 const position = await new Promise<GeolocationPosition>((resolve, reject) => {
 if (!navigator.geolocation) {
 reject(new Error("Geolocation is not supported"));
 return;
 }
 navigator.geolocation.getCurrentPosition(resolve, reject, {
 enableHighAccuracy: true,
 timeout: 15000,
 maximumAge: 0,
 });
 });
 const { latitude, longitude, accuracy } = position.coords;
 const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`);
 if (!response.ok) {
 throw new Error("Unable to get location name");
 }
 const data = await response.json();
 const address = data.address || {};
 const name =
 address.neighbourhood ||
 address.residential ||
 address.suburb ||
 address.road ||
 address.city ||
 address.town ||
 address.village ||
 data.display_name ||
 "Unknown location";
 setLocation({ latitude, longitude, accuracy, name });
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
