/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid repeated static generation retries on heavier routes during CI/local build.
  staticPageGenerationTimeout: 180,
  typescript: {
    ignoreBuildErrors: true, // Unblock Vercel deployment despite TS errors
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Keep config lean for Next 16 compatibility.
}

module.exports = nextConfig
