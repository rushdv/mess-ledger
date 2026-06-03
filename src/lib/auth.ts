import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Email + Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  // ── Google OAuth ──────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // update every day
  },

  // ── User extra fields ─────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MEMBER",
        required: false,
      },
    },
  },

  // ── Trusted origins ───────────────────────────────────────────────────────
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL ?? "",
    process.env.NEXT_PUBLIC_APP_URL ?? "",
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
