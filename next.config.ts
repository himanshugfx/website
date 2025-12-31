import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only for Docker - Vercel doesn't need it
  // Uncomment the line below if deploying with Docker
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.anosebeauty.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
