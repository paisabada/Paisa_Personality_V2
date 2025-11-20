/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // Allow Vercel OG Image Route
    runtime: 'edge'
  }
}

module.exports = nextConfig;
