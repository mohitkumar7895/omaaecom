import { NextResponse } from "next/server";
import { getAllZones } from "@/app/actions/zones";
import pool from "@/lib/db";
import { getAvailableCategoryIdsForLocation } from "@/lib/zone-matcher";

export async function GET(request: Request) {
  return handleMatch(request);
}

export async function POST(request: Request) {
  return handleMatch(request);
}

async function handleMatch(request: Request) {
  try {
    let lat: number | null = null;
    let lng: number | null = null;
    let city = "";
    let address = "";

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      lat = body.lat != null && !isNaN(Number(body.lat)) ? Number(body.lat) : null;
      lng = body.lng != null && !isNaN(Number(body.lng)) ? Number(body.lng) : null;
      city = body.city || "";
      address = body.address || "";
    } else {
      const { searchParams } = new URL(request.url);
      const latRaw = searchParams.get("lat");
      const lngRaw = searchParams.get("lng");
      lat = latRaw && !isNaN(Number(latRaw)) ? Number(latRaw) : null;
      lng = lngRaw && !isNaN(Number(lngRaw)) ? Number(lngRaw) : null;
      city = searchParams.get("city") || "";
      address = searchParams.get("address") || "";
    }

    const [zones, catRows] = await Promise.all([
      getAllZones(),
      pool.query("SELECT id, title, type, zones_location FROM categories WHERE status = 'Active'").then(([rows]: any) => rows || []).catch(() => []),
    ]);

    const activeZones = zones.filter((zone) => zone.status === "Active");

    // Combine address + city for accurate zone matching
    const lookupString = [address, city].filter(Boolean).join(" ");

    const result = getAvailableCategoryIdsForLocation(
      lat,
      lng,
      lookupString || city || null,
      activeZones,
      catRows
    );

    const isMatched = result.matchedZoneNames.length > 0;
    
    // Find the primary matched zone object
    const primaryZone = isMatched
      ? activeZones.find((z) => result.matchedZoneNames.includes(z.name)) || null
      : null;

    const displayLocationName = city || address || "your area";

    const isServiceable = result.allowedCategoryIds.length > 0;
    const finalZoneName = primaryZone?.name || (isMatched ? result.matchedZoneNames[0] : (isServiceable ? `${displayLocationName} Service Area` : "Outside Service Area"));

    return NextResponse.json(
      {
        success: true,
        isServiceable: isServiceable,
        zoneId: primaryZone?.id || null,
        zoneName: finalZoneName,
        matchedZoneNames: result.matchedZoneNames,
        allowedCategoryIds: result.allowedCategoryIds,
        message: isServiceable
          ? `${result.allowedCategoryIds.length} service categories available for ${displayLocationName}.`
          : `Doorstep services currently not active in ${displayLocationName}.`,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Failed to match zones:", error);
    return NextResponse.json(
      {
        success: true,
        isServiceable: false,
        zoneId: null,
        zoneName: "Outside Service Area",
        matchedZoneNames: [],
        allowedCategoryIds: [],
        message: "Failed to determine service zone.",
      }
    );
  }
}
