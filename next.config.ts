import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
