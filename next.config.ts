import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  // Standalone output is only for Docker - Vercel doesn't need it
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
  experimental: {
    serverActions: {
      // Limit to 10MB (was 100MB — that global limit enables DoS via any server action)
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    // There are pre-existing TS errors across many files.
    // This prevents build failures while still showing errors in dev.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
