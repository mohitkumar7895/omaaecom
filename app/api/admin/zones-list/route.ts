import { NextResponse } from "next/server";
import { getAllZones } from "../../../../app/actions/zones";

export async function GET() {
  try {
    const zones = await getAllZones();
    return NextResponse.json({ success: true, zones });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
