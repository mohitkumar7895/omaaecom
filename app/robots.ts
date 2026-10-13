import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

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
