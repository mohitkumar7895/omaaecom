import pool from "@/lib/db";
import { SEO_LOCATIONS } from "@/lib/seo-locations";

export interface UnifiedLocation {
  id: string;
  name: string;
  city: string;
  area: string;
  type: "zone" | "city" | "area" | "society";
  zoneId?: number;
}

export async function getUnifiedLocations(): Promise<UnifiedLocation[]> {
  const result: UnifiedLocation[] = [];
  const seen = new Set<string>();

  const addLoc = (item: UnifiedLocation) => {
    const key = `${item.name.toLowerCase()}|${item.city.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  };

  try {
    // 1. Fetch from service_zones table
    const [zoneRows]: any = await pool.query(
      "SELECT id, name, city_names FROM service_zones WHERE status = 'Active' ORDER BY name ASC"
    );

    if (zoneRows && zoneRows.length > 0) {
      for (const z of zoneRows) {
        const cityFirst = (z.city_names || "").split(",")[0]?.trim() || "Delhi NCR";
        addLoc({
          id: `zone-${z.id}`,
          name: z.name,
          city: cityFirst,
          area: z.name,
          type: "zone",
          zoneId: z.id,
        });
      }
    }
  } catch (err) {
    console.error("Error fetching service_zones for unified locations:", err);
  }

  try {
    // 2. Extract locations from categories.zones_location
    const [catRows]: any = await pool.query(
      "SELECT zones_location FROM categories WHERE status = 'Active' AND zones_location IS NOT NULL"
    );

    if (catRows && catRows.length > 0) {
      for (const row of catRows) {
        const parts = String(row.zones_location || "")
          .split(/[,;\n]+/)
          .map((s) => s.trim().replace(/^\/service-area\/?/i, "").replace(/[.]+$/, ""))
          .filter(Boolean);

        for (const part of parts) {
          if (!part || part.length < 2) continue;
          const cleanName = part.replace(/-/g, " ");
          const isGaur = /gaur\s*city/i.test(cleanName);
          const city = isGaur ? "Greater Noida" : cleanName;
          addLoc({
            id: `cat-${cleanName.toLowerCase().replace(/\s+/g, "-")}`,
            name: cleanName,
            city,
            area: cleanName,
            type: isGaur ? "society" : "area",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error parsing categories.zones_location for unified locations:", err);
  }

  // 3. Fallback / supplement with static SEO_LOCATIONS
  for (const loc of SEO_LOCATIONS) {
    addLoc({
      id: `seo-${loc.slug}`,
      name: loc.title,
      city: loc.region.includes("Delhi") ? "Delhi" : loc.region.includes("Uttar Pradesh") ? "Noida" : loc.title,
      area: loc.title,
      type: loc.kind || "city",
    });
  }

  return result;
}
