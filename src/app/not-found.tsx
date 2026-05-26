// Force dynamic — the root layout's SessionProvider (next-auth/react) resolves
// NEXTAUTH_URL at module init time, which fails during static pre-rendering.
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
