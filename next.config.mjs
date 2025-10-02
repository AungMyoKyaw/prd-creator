/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper handling of CSS imports
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  }
};

export default nextConfig;
