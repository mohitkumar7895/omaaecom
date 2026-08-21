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

    // Use OpenStreetMap Nominatim API for reverse geocoding
    // It requires a User-Agent header to comply with their usage policy
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OmaaEcom/1.0 (contact@omaa.com)", 
        "Accept-Language": "en-US,en;q=0.9", // Request English responses
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: "Unable to resolve location" },
        { status: 404 }
      );
    }

    const { address } = data;
    
    // Parse the address components
    const city = address.city || address.town || address.village || address.suburb || address.county || "";
    const state = address.state || "";
    const country = address.country || "";
    const postalCode = address.postcode || "";
    const formattedAddress = data.display_name;

    return NextResponse.json({
      success: true,
      data: {
        latitude,
        longitude,
        address: formattedAddress,
        city,
        state,
        country,
        postalCode,
      },
    });
  } catch (error) {
    console.error("Geocoding Error:", error);
    return NextResponse.json(
      { error: "Failed to process location data" },
      { status: 500 }
    );
  }
}
