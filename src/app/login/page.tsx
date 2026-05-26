// Server component wrapper — prevents static pre-rendering of this auth page
// (next-auth/react resolves NEXTAUTH_URL at module init which fails during build SSR)
export const dynamic = "force-dynamic";

import LoginClient from "./login-client";

export default function LoginPage() {
  return <LoginClient />;
}
