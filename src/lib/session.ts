/**
 * Server-side session helper.
 * Use this instead of getServerSession() from next-auth.
 *
 * Usage (server component or API route):
 *   import { getSession } from "@/lib/session";
 *   const session = await getSession();
 *   session?.user.id
 *   session?.user.role
 */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (session?.user?.id) {
    // Fetch the user from database to get the role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    if (user && session.user) {
      (session.user as any).role = user.role;
    }
  }
  
  return session;
}

// Shape helpers — keeps call sites clean
export type AppSession = Awaited<ReturnType<typeof getSession>> & {
  user?: { role?: string } & any;
};
export type AppUser = NonNullable<AppSession>["user"] & { role?: string };
