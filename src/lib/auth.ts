import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // On sign in, add user info to token
      if (user) {
        token.id = user.id;
        token.role = (user as { id: string; role?: string }).role || "MEMBER";
      }
      
      // For Google OAuth, ensure we have the user ID from database
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, check if user exists and create Member if needed
      if (account?.provider === "google" && user.email) {
        // Find or create user in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { messMembers: true },
        });

        // If user doesn't exist yet (first time login), PrismaAdapter might have already created it
        // or we need to ensure they are in a mess.
        if (!dbUser) {
          // This case is usually handled by PrismaAdapter, but let's be safe
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { messMembers: true },
          });
        }

        // If user exists (or was just created) but doesn't have any mess membership, add to demo mess
        if (dbUser && dbUser.messMembers.length === 0) {
          // Find demo mess or first available mess
          const demoMess = await prisma.mess.findFirst({
            where: { code: "DEMO2024" },
          });

          if (demoMess) {
            // Create MessMember (Role and access)
            await prisma.messMember.create({
              data: {
                userId: dbUser.id,
                messId: demoMess.id,
                role: "MEMBER",
              },
            });

            // Create Member record (for meals, payments, etc.)
            await prisma.member.create({
              data: {
                userId: dbUser.id,
                messId: demoMess.id,
              },
            });
          }
        }
      }
      return true;
    },
  },
};
