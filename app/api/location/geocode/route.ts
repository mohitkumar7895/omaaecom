import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API Key is not configured" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Maps API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: `Google Maps Geocoding failed: ${data.status}` },
        { status: 404 }
      );
    }

    const firstResult = data.results[0];
    const components = firstResult.address_components;

    // Helper to find specific type in address components
    const getComponent = (types: string[]) => {
      const comp = components.find((c: any) =>
        c.types.some((t: string) => types.includes(t))
      );
      return comp ? comp.long_name : "";
    };

    const mohalla = getComponent(["sublocality_level_1", "sublocality", "neighborhood", "colony"]);
    const city = getComponent(["locality", "administrative_area_level_3"]);
    const state = getComponent(["administrative_area_level_1"]);
    const country = getComponent(["country"]);
    const postalCode = getComponent(["postal_code"]);

    const fullAddress = firstResult.formatted_address;
    const shortAddress = mohalla && city && mohalla !== city ? `${mohalla}, ${city}` : (mohalla || city || fullAddress);

    const resolvedData = {
      address: fullAddress,
      shortAddress: shortAddress,
      fullAddress: fullAddress,
      mohalla: mohalla || "Local Area",
      city: city || "Local Area",
      state,
      country: country || "India",
      postalCode,
    };

    return NextResponse.json({
      success: true,
      data: resolvedData,
    });
  } catch (error: any) {
    console.error("Geocoding Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process location data" },
      { status: 500 }
    );
  }
}

