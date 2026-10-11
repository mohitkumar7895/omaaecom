import { NextResponse } from "next/server";
import { SEO_LOCATIONS } from "@/lib/seo-locations";
import { formatOsmPlace } from "@/lib/reverse-geocode";
import { googleMapsKey, googleSearchPlaces } from "@/lib/google-maps";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ success: false, error: "Missing search query" }, { status: 400 });
  }

  const q = query.toLowerCase();
  const local = SEO_LOCATIONS.filter((loc) => {
    const hay = `${loc.title} ${loc.slug.replace(/-/g, " ")} ${loc.region}`.toLowerCase();
    return hay.includes(q);
  })
    .slice(0, 5)
    .map((loc) => {
      const formatted = formatOsmPlace({
        display_name: `${loc.title}, ${loc.region}`,
        address: { city: loc.title, state: loc.region, country: "India" },
      });
      return {
        display_name: formatted?.shortAddress || `${loc.title}, ${loc.region}`,
        address: formatted,
        ...formatted,
      };
    });

  try {
    if (googleMapsKey()) {
      const google = await googleSearchPlaces(query);
      const mapped = google.map((formatted) => ({
        display_name: formatted.shortAddress,
        lat: formatted.latitude,
        lon: formatted.longitude,
        address: formatted,
        ...formatted,
      }));
      return NextResponse.json({ success: true, results: [...local, ...mapped] });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=8&countrycodes=in`;
    const resp = await fetch(nominatimUrl, {
      headers: { "User-Agent": "OMAA-App/1.0 (+https://omaacompany.com)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const data = resp.ok ? await resp.json() : [];
    const remote = (Array.isArray(data) ? data : [])
      .map((item) => formatOsmPlace(item))
      .filter(Boolean)
      .map((formatted) => ({
        display_name: formatted!.shortAddress,
        lat: formatted!.latitude,
        lon: formatted!.longitude,
        address: formatted,
        ...formatted,
      }));
    return NextResponse.json({ success: true, results: [...local, ...remote] });
  } catch {
    return NextResponse.json({ success: true, results: local });
  }
}
