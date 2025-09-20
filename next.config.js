/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commenté pour le développement
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
