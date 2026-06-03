"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "orange", "blue", "emerald"]}
      value={{
        light: "light",
        dark: "dark",
        orange: "orange",
        blue: "blue",
        emerald: "emerald",
      }}
    >
      {children}
    </ThemeProvider>
  );
}
