import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  // Optimize for Vercel deployment
  images: {
    // Allow R2 images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com'
      },
      {
        protocol: 'https',
        hostname: '**.loveyouall.qzz.io'
      }
    ]
  }
}

export default nextConfig
