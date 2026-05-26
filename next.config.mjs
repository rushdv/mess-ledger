/** @type {import('next').NextConfig} */
// Next.js configuration
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Ensure pages that use NextAuth are always dynamically rendered
  // This prevents "TypeError: Invalid URL" during static pre-rendering at build time
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
