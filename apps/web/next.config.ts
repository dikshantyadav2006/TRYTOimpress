import type { NextConfig } from "next";

const upstream =
  process.env.API_UPSTREAM ??
  (process.env.NODE_ENV === "production"
    ? "https://trytotry.onrender.com"
    : "http://localhost:8000");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/shared", "@repo/ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
  },
};

export default nextConfig;
