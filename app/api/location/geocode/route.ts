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

    let resolvedData: any = null;

    // 1. First attempt: BigDataCloud Hyper-Local Reverse Geocoding (Specialized in Indian Localities, Mohallas, Wards & Societies)
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl);
      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        if (bdc && (bdc.locality || bdc.city || bdc.principalSubdivision)) {
          const localityInfo = bdc.localityInfo?.administrative || [];
          const informative = bdc.localityInfo?.informative || [];
          
          // Extract deep local area names (Mohalla, Ward, Colony, Suburb)
          const deepLocalities = informative
            .filter((item: any) => item.description?.includes("neighbourhood") || item.description?.includes("suburb") || item.order >= 8)
            .map((item: any) => item.name);

          const mohalla = bdc.locality || deepLocalities[0] || "";
          const cityOrDistrict = bdc.city || bdc.principalSubdivision || "";
          const district = bdc.localityInfo?.administrative?.find((a: any) => a.adminLevel === 6)?.name || "";
          const state = bdc.principalSubdivision || "";
          const postalCode = bdc.postcode || "";

          const parts = [
            mohalla,
            cityOrDistrict !== mohalla ? cityOrDistrict : "",
            district && district !== cityOrDistrict ? district : "",
            state,
            postalCode
          ].filter(Boolean);

          const fullAddress = parts.join(", ");
          const shortAddress = mohalla && cityOrDistrict && mohalla !== cityOrDistrict ? `${mohalla}, ${cityOrDistrict}` : fullAddress;

          resolvedData = {
            latitude,
            longitude,
            address: fullAddress,
            shortAddress: shortAddress,
            fullAddress: fullAddress,
            mohalla: mohalla,
            city: cityOrDistrict || "Local Area",
            state,
            country: bdc.countryName || "India",
            postalCode,
          };
        }
      }
    } catch (e) {
      console.warn("BigDataCloud geocode failed, falling back to OSM Nominatim:", e);
    }

    // 2. Second attempt: OpenStreetMap High Precision Zoom Level 18 Geocoding
    if (!resolvedData || !resolvedData.mohalla) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        const osmRes = await fetch(osmUrl, {
          headers: {
            "User-Agent": "OmaaEcomApp/4.0 (contact@omaacompany.com)", 
            "Accept-Language": "en-IN,hi,en;q=0.9",
          },
        });

        if (osmRes.ok) {
          const data = await osmRes.json();
          if (data && data.display_name) {
            const { address } = data;
            const landmark = address.amenity || address.shop || address.historic || address.tourism || address.building || "";
            const road = address.road || address.pedestrian || address.street || address.path || "";
            const mohalla = address.neighbourhood || address.residential || address.suburb || address.quarter || address.village || address.hamlet || address.ward || "";
            const locality = address.locality || address.town || address.city || address.municipality || address.county || "";
            const district = address.state_district || address.county || "";
            const state = address.state || "";
            const postalCode = address.postcode || "";

            const combinedParts = [
              landmark,
              road,
              mohalla,
              locality,
              district !== locality ? district : "",
              state,
              postalCode
            ].filter(Boolean);

            const unique = combinedParts.filter((item, idx, arr) => arr.indexOf(item) === idx);
            const fullAddress = unique.length > 0 ? unique.join(", ") : data.display_name;
            const shortAddress = [landmark || road || mohalla, locality || district].filter(Boolean).join(", ") || fullAddress;

            resolvedData = {
              latitude,
              longitude,
              address: fullAddress,
              shortAddress: shortAddress,
              fullAddress: fullAddress,
              mohalla: mohalla || landmark || road,
              city: locality || district || "Local Area",
              state,
              country: address.country || "India",
              postalCode,
            };
          }
        }
      } catch (err) {
        console.error("OSM Geocode error:", err);
      }
    }

    if (!resolvedData) {
      return NextResponse.json(
        { error: "Unable to resolve location" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resolvedData,
    });
  } catch (error) {
    console.error("Geocoding Error:", error);
    return NextResponse.json(
      { error: "Failed to process location data" },
      { status: 500 }
    );
  }
}
