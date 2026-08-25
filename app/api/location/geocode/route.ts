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

    // Use OpenStreetMap Nominatim API with zoom=18 and addressdetails=1 for highest precision micro-level reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1&namedetails=1`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OmaaEcomHyperLocal/3.0 (support@omaacompany.com)", 
        "Accept-Language": "en-IN,hi,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error || !data.display_name) {
      return NextResponse.json(
        { error: "Unable to resolve location" },
        { status: 404 }
      );
    }

    const { address, namedetails } = data;
    
    // Exact Map Location Name
    const rawDisplayName = data.display_name;

    // Hyper-local parts: Mohalla, Gali, Road, Landmark, Village, Ward
    const mohallaOrGali = 
      address.neighbourhood || 
      address.residential || 
      address.suburb || 
      address.quarter || 
      address.village || 
      address.hamlet || 
      address.road || 
      address.amenity || 
      address.building || 
      "";

    const cityOrTown = 
      address.town || 
      address.city || 
      address.village || 
      address.municipality || 
      address.subdistrict || 
      address.county || 
      "";

    const state = address.state || "";
    const postalCode = address.postcode || "";

    // Short representation: e.g. "Mohalla / Road Name, Bharthana"
    const shortLabel = mohallaOrGali && cityOrTown && mohallaOrGali.toLowerCase() !== cityOrTown.toLowerCase()
      ? `${mohallaOrGali}, ${cityOrTown}`
      : rawDisplayName.split(",").slice(0, 3).join(",");

    return NextResponse.json({
      success: true,
      data: {
        latitude,
        longitude,
        address: rawDisplayName, // Pura exact Map ka address (Mohalla, Landmark, Road, Town, Pincode)
        shortAddress: shortLabel,
        fullAddress: rawDisplayName,
        mohalla: mohallaOrGali,
        city: cityOrTown || "Local Area",
        state,
        country: address.country || "India",
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
