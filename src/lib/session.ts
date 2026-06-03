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

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Shape helpers — keeps call sites clean
export type AppSession = Awaited<ReturnType<typeof getSession>>;
export type AppUser = NonNullable<AppSession>["user"];
