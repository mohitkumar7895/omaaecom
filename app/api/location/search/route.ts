import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query 'q' is required" },
        { status: 400 }
      );
    }

    // Use OpenStreetMap Nominatim API for forward geocoding (searching)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5`;
    
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

    const results = data.map((item: any) => {
      const address = item.address || {};
      const city = address.city || address.town || address.village || address.suburb || address.county || item.name || "";
      
      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.display_name,
        city,
        state: address.state || "",
        country: address.country || "",
        postalCode: address.postcode || "",
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Geocoding Search Error:", error);
    return NextResponse.json(
      { error: "Failed to search location" },
      { status: 500 }
    );
  }
}
