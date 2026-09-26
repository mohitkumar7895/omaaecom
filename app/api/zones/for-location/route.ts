import { NextResponse } from "next/server";
import { getAllZones } from "@/app/actions/zones";
import pool from "@/lib/db";
import { getAvailableCategoryIdsForLocation } from "@/lib/zone-matcher";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");
    const city = searchParams.get("city") || "";
    const lat = latRaw ? Number(latRaw) : null;
    const lng = lngRaw ? Number(lngRaw) : null;

    const [zones, catRows] = await Promise.all([
      getAllZones(),
      pool.query("SELECT id FROM categories WHERE status = 'Active'").then(([rows]: any) => rows || []).catch(() => []),
    ]);

    const result = getAvailableCategoryIdsForLocation(
      lat,
      lng,
      city || null,
      zones.filter((zone) => zone.status === "Active"),
      catRows
    );

    return NextResponse.json(
      {
        allowedCategoryIds:
          result.isLocationRestricted && result.allowedCategoryIds.length > 0
            ? result.allowedCategoryIds
            : null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to match zones:", error);
    return NextResponse.json({ allowedCategoryIds: null });
  }
}
