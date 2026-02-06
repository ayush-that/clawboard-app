import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "recharts",
      "date-fns",
      "motion",
      "radix-ui",
      "usehooks-ts",
    ],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
