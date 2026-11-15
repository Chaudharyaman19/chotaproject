/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_DIST_DIR lets a second dev/preview server run next to the main one without sharing `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.dummyjson.com' },
    ],
  },
};
module.exports = nextConfig;
