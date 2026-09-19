import { NextResponse } from "next/server";
import { getAllZones } from "@/app/actions/zones";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await getAllZones();
    return NextResponse.json({
      success: true,
      zones: zones.filter((zone) => zone.status === "Active"),
    });
  } catch (error) {
    console.error("Failed to load active zones:", error);
    return NextResponse.json({ success: true, zones: [] });
  }
}
