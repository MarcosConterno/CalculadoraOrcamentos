import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Gera a build standalone para Docker
};

export default nextConfig;
