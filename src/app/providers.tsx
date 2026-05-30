"use client";

// Global providers for Next.js App (Theme & Session management)

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "orange", "blue", "emerald", "system"]}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
