import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  // Properly handle assets in development
  publicExcludes: ['!robots.txt', '!sitemap.xml']
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper handling of CSS imports
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  }
};

export default withPWA(nextConfig);
