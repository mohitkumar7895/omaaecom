import { NextResponse } from "next/server";
import { getAllZones } from "@/app/actions/zones";

export async function GET() {
  try {
    const zones = await getAllZones();
    const slim = zones
      .filter((zone) => zone.status === "Active")
      .map((zone) => ({
        id: zone.id,
        name: zone.name,
        city_names: zone.city_names,
        category_ids: zone.category_ids,
      }));
    return NextResponse.json(
      { success: true, zones: slim },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load active zones:", error);
    return NextResponse.json({ success: true, zones: [] });
  }
}
