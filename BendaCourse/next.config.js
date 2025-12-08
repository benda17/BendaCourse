/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
    unoptimized: false, // Enable image optimization for web
  },
  poweredByHeader: false, // Remove X-Powered-By header for security
}

module.exports = nextConfig

