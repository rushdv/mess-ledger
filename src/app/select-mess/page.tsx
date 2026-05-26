// Server component wrapper — prevents static pre-rendering of this auth page
// (next-auth/react resolves NEXTAUTH_URL at module init which fails during build SSR)
export const dynamic = "force-dynamic";

import SelectMessClient from "./select-mess-client";

export default function SelectMessPage() {
  return <SelectMessClient />;
}
