import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Root layout wrapper that sets up global HTML structure, fonts, and themes
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

import type { Viewport, Metadata } from "next";

export const metadata: Metadata = {
  title: "MessLedger — Mess Expense Tracker",
  description: "Track meals, bazar costs, utilities, and dues for your mess",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MessLedger",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
