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
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OmaaEcomApp/2.0 (support@omaacompany.com)", 
        "Accept-Language": "hi,en-IN,en;q=0.9", // Indian Hindi/English responses for accurate local names
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
    
    // Extract exact hyper-local components (Mohalla, Landmark, Colony, Road, Gali, Village, Ward)
    const landmark = address.amenity || address.shop || address.historic || address.tourism || address.building || address.office || "";
    const houseNumber = address.house_number || address.house_name || "";
    const road = address.road || address.pedestrian || address.street || address.path || address.footway || "";
    
    // Mohalla / Colony / Ward / Suburb / Sector / Gram
    const mohalla = 
      address.neighbourhood || 
      address.residential || 
      address.suburb || 
      address.quarter || 
      address.village || 
      address.hamlet || 
      address.city_district || 
      address.subdistrict || 
      address.ward || 
      "";

    const locality = address.locality || address.town || address.city || address.municipality || address.county || "";
    const district = address.state_district || address.county || "";
    const state = address.state || "";
    const country = address.country || "India";
    const postalCode = address.postcode || "";

    // Build Exact Local Mohalla / Landmark Area Address
    const exactLocalParts = [
      landmark,
      houseNumber ? `House ${houseNumber}` : "",
      road,
      mohalla,
      locality,
      district !== locality ? district : "",
      state,
      postalCode
    ].filter(Boolean);

    // Remove consecutive duplicates
    const uniqueParts = exactLocalParts.filter((item, index, self) => 
      self.findIndex(t => t.toLowerCase() === item.toLowerCase()) === index
    );

    const fullExactAddress = uniqueParts.length > 0 ? uniqueParts.join(", ") : (data.display_name || "Current Location");

    // Short display for Navbar / Header: (e.g. "Mohalla / Road, Bharthana" or "Gaur City 2, Greater Noida")
    const shortAreaParts = [landmark || road || mohalla, locality || district].filter(Boolean);
    const shortAddress = shortAreaParts.length > 0 ? shortAreaParts.join(", ") : (mohalla || locality || fullExactAddress);

    return NextResponse.json({
      success: true,
      data: {
        latitude,
        longitude,
        address: fullExactAddress,
        shortAddress: shortAddress,
        fullAddress: fullExactAddress,
        mohalla: mohalla || landmark,
        city: locality || district || "Local Area",
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
