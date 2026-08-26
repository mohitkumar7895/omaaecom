// app/api/location/search/route.ts
import { NextResponse } from 'next/server';

// Simple GET endpoint that proxies Nominatim search queries.
// Expected query param: ?q=<search term>
// Returns an array of Nominatim place objects.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ success: false, error: 'Missing search query' }, { status: 400 });
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`;
  try {
    const resp = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'OMAA-App/1.0 (+https://omaa.com)' },
    });
    const data = await resp.json();
    return NextResponse.json({ success: true, results: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Search failed' }, { status: 500 });
  }
}
