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
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout",
          "/cart",
          "/login",
          "/manage-address",
          "/wallet",
          "/my-bookings",
          "/invoice/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout",
          "/cart",
          "/login",
          "/manage-address",
          "/wallet",
          "/my-bookings",
          "/invoice/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
