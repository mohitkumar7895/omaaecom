import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.omaacompany.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/image",
          "/checkout",
          "/cart",
          "/manage-address",
          "/login",
          "/Member_Login",
          "/wallet",
          "/my-bookings",
          "/my-amc",
          "/invoice/",
          "/settings",
          "/product-history",
          "/cashback",
          "/refer-earn",
          "/sitemap-directory",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
