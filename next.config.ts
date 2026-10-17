import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    minimumCacheTTL: 86400,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/api/search",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=120" }],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/Hero1.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://omaacompany.com",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://omaacompany.com/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "www.omaacompany.com" }],
        destination: "https://omaacompany.com",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.omaacompany.com" }],
        destination: "https://omaacompany.com/:path*",
        permanent: true,
      },
      {
        source: "/sitemap",
        destination: "/service-areas",
        permanent: true,
      },
      {
        source: "/sitemap/",
        destination: "/service-areas",
        permanent: true,
      },
      {
        source: "/sitemap-pages",
        destination: "/service-areas",
        permanent: true,
      },
      {
        source: "/:location/ro-repair-and-service",
        destination: "/:location/ro-repair",
        permanent: true,
      },
      {
        source: "/:location/washing-machines-repair",
        destination: "/:location/washing-machine-repair",
        permanent: true,
      },
      {
        source: "/:location/fridge-repair",
        destination: "/:location/refrigerator-repair",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
