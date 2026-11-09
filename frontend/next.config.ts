import type { NextConfig } from "next";

let rawBackendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
if (rawBackendUrl && !rawBackendUrl.startsWith("http://") && !rawBackendUrl.startsWith("https://")) {
  rawBackendUrl = `https://${rawBackendUrl}`;
}
const backendUrl = rawBackendUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker
  output: "standalone",

  // Proxy API requests to the Django backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
