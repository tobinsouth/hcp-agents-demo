/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Run ESLint during production builds for better code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during production builds
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig