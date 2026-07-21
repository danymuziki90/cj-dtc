/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Avoid repeated static generation retries on heavier routes during CI/local build.
  staticPageGenerationTimeout: 300,
  typescript: {
    ignoreBuildErrors: false, // Block Vercel deployment if TypeScript errors exist (code compiles perfectly)
  },
  images: {
    remotePatterns: [
      // Cloudflare R2: domaine public r2.dev (accès public requis sur le bucket)
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      // Cloudflare R2: endpoint direct du bucket (utilisé pour les URLs sans domaine personnalisé)
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // Images libres Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Reduce memory usage during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'sharp': 'commonjs sharp'
      })
    }
    return config
  },
  async redirects() {
    return [
      // Un-localized /student redirects
      { source: '/student', destination: '/fr/espace-etudiants', permanent: true },
      { source: '/student/dashboard', destination: '/fr/espace-etudiants', permanent: true },
      { source: '/student/inscriptions', destination: '/fr/espace-etudiants/mes-formations', permanent: true },
      { source: '/student/elearning', destination: '/fr/espace-etudiants/elearning', permanent: true },
      { source: '/student/assignments', destination: '/fr/espace-etudiants/travaux', permanent: true },
      { source: '/student/exams', destination: '/fr/espace-etudiants/resultats', permanent: true },
      { source: '/student/certificates', destination: '/fr/espace-etudiants/mes-certificats', permanent: true },
      { source: '/student/profile', destination: '/fr/espace-etudiants/mon-compte', permanent: true },
      { source: '/student/settings', destination: '/fr/espace-etudiants/mon-compte', permanent: true },
      { source: '/student/temoignages', destination: '/fr/espace-etudiants/temoignages', permanent: true },
      { source: '/student/ressources', destination: '/fr/espace-etudiants/supports', permanent: true },
      { source: '/student/login', destination: '/fr/auth/login', permanent: true },
      { source: '/student/register', destination: '/fr/auth/register', permanent: true },
      { source: '/student/forgot-password', destination: '/fr/auth/forgot-password', permanent: true },
      { source: '/student/reset-password', destination: '/fr/auth/reset-password', permanent: true },

      // Localized /:locale/student redirects
      { source: '/:locale/student', destination: '/:locale/espace-etudiants', permanent: true },
      { source: '/:locale/student/dashboard', destination: '/:locale/espace-etudiants', permanent: true },
      { source: '/:locale/student/inscriptions', destination: '/:locale/espace-etudiants/mes-formations', permanent: true },
      { source: '/:locale/student/elearning', destination: '/:locale/espace-etudiants/elearning', permanent: true },
      { source: '/:locale/student/assignments', destination: '/:locale/espace-etudiants/travaux', permanent: true },
      { source: '/:locale/student/exams', destination: '/:locale/espace-etudiants/resultats', permanent: true },
      { source: '/:locale/student/certificates', destination: '/:locale/espace-etudiants/mes-certificats', permanent: true },
      { source: '/:locale/student/profile', destination: '/:locale/espace-etudiants/mon-compte', permanent: true },
      { source: '/:locale/student/settings', destination: '/:locale/espace-etudiants/mon-compte', permanent: true },
      { source: '/:locale/student/temoignages', destination: '/:locale/espace-etudiants/temoignages', permanent: true },
      { source: '/:locale/student/ressources', destination: '/:locale/espace-etudiants/supports', permanent: true },

      // Admin news redirect
      { source: '/admin/news', destination: '/admin/articles', permanent: true },
    ]
  },
  // Keep config lean for Next 16 compatibility.
  turbopack: {
    // Empty config to acknowledge we've reviewed Turbopack compatibility
    // and silence the error about webpack config without turbopack config
  },
}

module.exports = nextConfig
