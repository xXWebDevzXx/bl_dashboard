import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable Turbopack to use webpack with polling for Docker compatibility
  experimental: {
    turbo: undefined,
  },
  // Enable file watching in Docker with polling
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: ['**/node_modules', '**/.next'],
      };
    }
    return config;
  },
};

export default nextConfig;
