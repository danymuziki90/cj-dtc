/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com']
  },
  // Supprimer l'option experimental qui n'est plus nécessaire dans Next.js 14
}
module.exports = nextConfig
