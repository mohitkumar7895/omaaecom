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

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API Key is not configured" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Maps API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status !== "OK" || !data.results) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const results = data.results.map((item: any) => {
      const components = item.address_components || [];
      const getComponent = (types: string[]) => {
        const comp = components.find((c: any) =>
          c.types.some((t: string) => types.includes(t))
        );
        return comp ? comp.long_name : "";
      };

      const city = getComponent(["locality", "administrative_area_level_3"]);
      const state = getComponent(["administrative_area_level_1"]);
      const country = getComponent(["country"]);
      const postalCode = getComponent(["postal_code"]);

      return {
        address: item.formatted_address,
        city: city || "Local Area",
        state,
        country,
        postalCode,
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Geocoding Search Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search location" },
      { status: 500 }
    );
  }
}

