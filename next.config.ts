import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['3b2a-177-248-134-63.ngrok-free.app'],
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
