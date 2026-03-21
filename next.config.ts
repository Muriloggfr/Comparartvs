import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['cheerio', '@anthropic-ai/sdk'],
};

export default nextConfig;
