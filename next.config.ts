import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp", "image/avif"],
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
        source: "/:path*.(ico|svg|woff2|jpg|jpeg|png|webp|gif)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sitemap",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/sitemap/",
        destination: "/sitemap.xml",
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
