"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert, Menu, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/messes", label: "Messes" },
  { href: "/super-admin/users", label: "Users" },
  { href: "/super-admin/analytics", label: "Analytics" },
  { href: "/super-admin/audit-logs", label: "Audit Logs" },
];

const pageTitles: Record<string, string> = {
  "/super-admin": "Admin Overview",
  "/super-admin/messes": "Messes",
  "/super-admin/users": "Users",
  "/super-admin/analytics": "Analytics",
  "/super-admin/audit-logs": "Audit Logs",
};

export function AdminTopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = pageTitles[pathname] ?? "Admin Portal";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-3 border-b px-6 bg-primary/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <ShieldAlert className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Admin Portal</span>
              </div>
              <nav className="flex flex-col space-y-1 p-4">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-0 w-full border-t p-4">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Home className="h-4 w-4" />
                  Exit Admin
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
        </div>
      </div>
    </header>
  );
}
