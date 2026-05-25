/** @type {import('next').NextConfig} */
// Next.js configuration with experimental serverActions allowedOrigins setting
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
