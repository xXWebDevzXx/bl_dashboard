import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Empty turbopack config to silence the warning about webpack config
  turbopack: {},
  
  // Enable file watching in Docker with polling
  // This is crucial for Docker on Windows where file system events don't propagate properly
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
