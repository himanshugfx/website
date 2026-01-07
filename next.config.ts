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
      {
        // Vercel Blob Storage for legacy uploaded images
        protocol: 'https',
        hostname: 'dz1tvnkclawmrdnm.public.blob.vercel-storage.com',
      },
      {
        // Odoo for imported product images
        protocol: 'https',
        hostname: 'anosebeauty.odoo.com',
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
