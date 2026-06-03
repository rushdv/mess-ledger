import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        ...(process.env.BETTER_AUTH_URL
          ? [new URL(process.env.BETTER_AUTH_URL).hostname]
          : []),
        ...(process.env.NEXT_PUBLIC_APP_URL
          ? [new URL(process.env.NEXT_PUBLIC_APP_URL).hostname]
          : []),
      ].filter(Boolean),
    },
  },

  // better-auth's kysely adapter dynamically imports SQLite dialects that
  // reference kysely internals not exported in newer kysely versions.
  // We only use the Prisma adapter, so stub these SQLite-only files out.
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Tell webpack to ignore the dynamic SQLite dialect imports inside
      // @better-auth/kysely-adapter — they are never used with Prisma.
      config.plugins = config.plugins || [];

      const webpack = config.constructor;

      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        // Match the problematic SQLite dialect files by pattern
        test: /better-auth.*kysely-adapter.*(?:bun-sqlite|d1-sqlite|node-sqlite)/,
        use: "null-loader",
      });
    }
    return config;
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
