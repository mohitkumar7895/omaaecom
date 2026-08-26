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

    let results: any[] = [];
    let succeeded = false;

    // 1. Google Maps Geocoding (Primary)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && data.results) {
            results = data.results.map((item: any) => {
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
            succeeded = true;
          }
        }
      } catch (e) {
        console.error("Google Geocoding search fallback:", e);
      }
    }

    // 2. Fallback: OpenStreetMap Nominatim Search
    if (!succeeded) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "OmaaEcom/1.0 (contact@omaa.com)", 
            "Accept-Language": "en-US,en;q=0.9",
          },
        });

        if (response.ok) {
          const data = await response.json();
          results = data.map((item: any) => {
            const address = item.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county || item.name || "";
            return {
              address: item.display_name,
              city: city || "Local Area",
              state: address.state || "",
              country: address.country || "",
              postalCode: address.postcode || "",
            };
          });
        }
      } catch (err) {
        console.error("OSM Geocoding search fallback error:", err);
      }
    }

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

