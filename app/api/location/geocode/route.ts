import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { latitude, longitude } = body || {};

    let resolvedData: any = null;

    // 0. If no coordinates provided, attempt IP Geolocation fallback via BigDataCloud
    if (!latitude || !longitude) {
      try {
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
        const bdcIpUrl = clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1"
          ? `https://api.bigdatacloud.net/data/reverse-geocode-client?ip=${clientIp}&localityLanguage=en`
          : `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en`;

        const ipRes = await fetch(bdcIpUrl);
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && (ipData.city || ipData.locality || ipData.principalSubdivision)) {
            const cityOrDistrict = ipData.city || ipData.locality || ipData.principalSubdivision || "Local Area";
            const state = ipData.principalSubdivision || "";
            const country = ipData.countryName || "India";
            const fullAddress = [cityOrDistrict, state, country].filter(Boolean).join(", ");

            resolvedData = {
              address: fullAddress,
              shortAddress: cityOrDistrict,
              fullAddress: fullAddress,
              houseNumber: "",
              street: "",
              mohalla: cityOrDistrict,
              city: cityOrDistrict,
              state: state,
              country: country,
              postalCode: ipData.postcode || "",
              latitude: ipData.latitude || 0,
              longitude: ipData.longitude || 0,
            };
          }
        }
      } catch (ipErr) {
        console.warn("IP Geolocation fallback failed:", ipErr);
      }

      if (resolvedData) {
        return NextResponse.json({
          success: true,
          data: resolvedData,
        });
      }

      return NextResponse.json(
        { error: "Latitude and longitude are required and IP lookup failed" },
        { status: 400 }
      );
    }

    // 1. Google Maps Geocoding (Primary - High Precision)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && data.results && data.results.length > 0) {
            const firstResult = data.results[0];
            const components = firstResult.address_components;

            const getComponent = (types: string[]) => {
              const comp = components.find((c: any) =>
                c.types.some((t: string) => types.includes(t))
              );
              return comp ? comp.long_name : "";
            };

            const houseNumber = getComponent(["street_number"]);
            const street = getComponent(["route"]);
            const mohalla = getComponent(["sublocality_level_1", "sublocality", "neighborhood", "colony"]);
            const city = getComponent(["locality", "administrative_area_level_3"]);
            const state = getComponent(["administrative_area_level_1"]);
            const country = getComponent(["country"]);
            const postalCode = getComponent(["postal_code"]);

            const fullAddress = firstResult.formatted_address;
            const shortAddress = mohalla && city && mohalla !== city ? `${mohalla}, ${city}` : (mohalla || city || fullAddress);

            resolvedData = {
              address: fullAddress,
              shortAddress: shortAddress,
              fullAddress: fullAddress,
              houseNumber: houseNumber || "",
              street: street || "",
              mohalla: mohalla || "Local Area",
              city: city || "Local Area",
              state,
              country: country || "India",
              postalCode,
            };
          } else {
            console.warn(`Google Maps Geocoding failed with status: ${data.status}. Message: ${data.error_message}`);
          }
        }
      } catch (e) {
        console.error("Google Maps Geocoding request error, falling back:", e);
      }
    }

    // 2. Fallback: BigDataCloud Reverse Geocoding
    if (!resolvedData) {
      try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const bdcRes = await fetch(bdcUrl);
        if (bdcRes.ok) {
          const bdc = await bdcRes.json();
          if (bdc && (bdc.locality || bdc.city || bdc.principalSubdivision)) {
            const informative = bdc.localityInfo?.informative || [];
            const deepLocalities = informative
              .filter((item: any) => item.description?.includes("neighbourhood") || item.description?.includes("suburb") || item.order >= 8)
              .map((item: any) => item.name);

            const mohalla = bdc.locality || deepLocalities[0] || "";
            const cityOrDistrict = bdc.city || bdc.principalSubdivision || "";
            const state = bdc.principalSubdivision || "";
            const postalCode = bdc.postcode || "";

            const parts = [
              mohalla,
              cityOrDistrict !== mohalla ? cityOrDistrict : "",
              state,
              postalCode
            ].filter(Boolean);

            const fullAddress = parts.join(", ");
            const shortAddress = mohalla && cityOrDistrict && mohalla !== cityOrDistrict ? `${mohalla}, ${cityOrDistrict}` : fullAddress;

            resolvedData = {
              address: fullAddress,
              shortAddress: shortAddress,
              fullAddress: fullAddress,
              houseNumber: "",
              street: "",
              mohalla: mohalla,
              city: cityOrDistrict || "Local Area",
              state,
              country: bdc.countryName || "India",
              postalCode,
            };
          }
        }
      } catch (e) {
        console.warn("BigDataCloud fallback failed:", e);
      }
    }

    // 3. Fallback: OpenStreetMap Nominatim Geocoding
    if (!resolvedData) {
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
            const state = address.state || "";
            const postalCode = address.postcode || "";

            const combinedParts = [
              landmark,
              road,
              mohalla,
              locality,
              state,
              postalCode
            ].filter(Boolean);

            const unique = combinedParts.filter((item, idx, arr) => arr.indexOf(item) === idx);
            const fullAddress = unique.length > 0 ? unique.join(", ") : data.display_name;
            const shortAddress = [landmark || road || mohalla, locality].filter(Boolean).join(", ") || fullAddress;

            resolvedData = {
              address: fullAddress,
              shortAddress: shortAddress,
              fullAddress: fullAddress,
              houseNumber: address.house_number || address.building || "",
              street: address.road || "",
              mohalla: mohalla || landmark || road,
              city: locality || "Local Area",
              state,
              country: address.country || "India",
              postalCode,
            };
          }
        }
      } catch (err) {
        console.error("OSM Geocode fallback error:", err);
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
  } catch (error: any) {
    console.error("Geocoding Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process location data" },
      { status: 500 }
    );
  }
}

