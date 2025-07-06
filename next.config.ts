import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Reduce development logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
