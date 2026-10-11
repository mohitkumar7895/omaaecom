import { NextRequest, NextResponse } from "next/server";
import { clientIpFromRequest, lookupIpinfoLocation } from "@/lib/ipinfo";
import { reverseGeocodeCoords } from "@/lib/reverse-geocode";

export async function GET(req: NextRequest) {
  return resolve(req);
}

export async function POST(req: NextRequest) {
  return resolve(req);
}

async function resolve(req: NextRequest) {
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

    if (hasCoords) {
      const data = await reverseGeocodeCoords(latitude, longitude);
      if (!data) {
        return NextResponse.json({ error: "Unable to resolve location" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data });
    }

    const ip = clientIpFromRequest(req.headers);
    const data = await lookupIpinfoLocation(ip);
    if (!data) {
      return NextResponse.json({ error: "Unable to resolve location" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process location data" },
      { status: 500 }
    );
  }
}
