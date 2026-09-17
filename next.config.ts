import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
<<<<<<< HEAD
  
  async redirects() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ];
  },
=======
>>>>>>> e1188c7b0ff9a791f56bae097d046e40ba9efaff
};

export default nextConfig;
