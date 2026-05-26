// Server component wrapper — prevents static pre-rendering of this auth page
export const dynamic = "force-dynamic";

import RegisterClient from "./register-client";

export default function RegisterPage() {
  return <RegisterClient />;
}
