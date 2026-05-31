/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        ...(process.env.NEXTAUTH_URL ? [new URL(process.env.NEXTAUTH_URL).hostname] : []),
      ],
    },
  },
};

export default nextConfig;
