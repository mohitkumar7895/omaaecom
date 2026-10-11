import { NextResponse } from "next/server";
import {
  googleAutocompleteSuggestions,
  googleMapsKey,
  googlePlaceDetails,
} from "@/lib/google-maps";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId")?.trim();
  const sessionToken = url.searchParams.get("session")?.trim() || undefined;
  const query = url.searchParams.get("q")?.trim();

  try {
    if (placeId) {
      const details = await googlePlaceDetails(placeId, sessionToken);
      if (!details) {
        return NextResponse.json({ success: false, error: "Place not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: details });
    }

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing search query" }, { status: 400 });
    }

    if (query.length < 3) {
      return NextResponse.json({ success: true, results: [] });
    }

    if (!googleMapsKey()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const suggestions = await googleAutocompleteSuggestions(query, sessionToken);
    const results = suggestions.map((s) => ({
      placeId: s.placeId,
      display_name: s.text,
      mainText: s.mainText,
      secondaryText: s.secondaryText,
      shortAddress: s.mainText,
      address: s.text,
      city: s.secondaryText,
    }));

    return NextResponse.json({ success: true, results });
  } catch {
    return NextResponse.json({ success: true, results: [] });
  }
}
