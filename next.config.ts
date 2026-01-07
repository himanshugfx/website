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
  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
