"use client";
import { useEffect, useRef } from "react";
import type { Zone } from "../app/types/zone";
declare const google: any;
type Props = {
  zones: Zone[];
  onAddZone: (zone: Zone) => void;
  onUpdateZone: (zone: Zone) => void;
  onDeleteZone: (id: string) => void;
};

export default function ZoneMap({ zones, onAddZone, onUpdateZone, onDeleteZone }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const circles = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    const google = (window as any).google;
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.209 }, // Delhi default
      zoom: 10,
    });

    // Render existing zones
    zones.forEach(z => {
      const circle = new google.maps.Circle({
        map: mapInstance.current!,
        center: { lat: z.latitude, lng: z.longitude },
        radius: z.radiusMeters,
        fillColor: "#6699FF",
        fillOpacity: 0.3,
        strokeColor: "#3366FF",
        strokeWeight: 2,
      });
      // Click to edit radius
      circle.addListener("click", () => {
        const newRadius = prompt("Enter new radius (meters)", String(z.radiusMeters));
        if (newRadius) {
          const updated = { ...z, radiusMeters: Number(newRadius) };
          onUpdateZone(updated);
          circle.setRadius(updated.radiusMeters);
        }
      });
      circles.current.push(circle);
    });
  }, [zones]);

  // Add zone on map click
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const listener = map.addListener("click", (e: any) => {
      const name = prompt("Zone name");
      if (!name) return;
      const radiusStr = prompt("Radius in meters", "500");
      const radius = radiusStr ? Number(radiusStr) : 500;
      const newZone: Zone = {
        id: crypto.randomUUID(),
        name,
        latitude: e.latLng!.lat(),
        longitude: e.latLng!.lng(),
        radiusMeters: radius,
      };
      onAddZone(newZone);
      new google.maps.Circle({
        map,
        center: { lat: newZone.latitude, lng: newZone.longitude },
        radius: newZone.radiusMeters,
        fillColor: "#66CC66",
        fillOpacity: 0.3,
        strokeColor: "#33AA33",
        strokeWeight: 2,
      });
    });
    return () => (window as any).google.maps.event.removeListener(listener);
  }, []);

  return <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />;
}
