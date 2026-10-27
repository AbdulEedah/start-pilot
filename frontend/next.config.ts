import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker
  output: "standalone",

  // Proxy API requests to the Django backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
