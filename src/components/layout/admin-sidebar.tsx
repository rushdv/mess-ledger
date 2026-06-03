"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  ShieldAlert,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const adminNavItems = [
  { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
  { href: "/super-admin/messes", label: "Messes", icon: Building2 },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/super-admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  }

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6 bg-primary/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldAlert className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">Admin Portal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t p-4 space-y-3">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="h-4 w-4" />
          Exit Admin
        </Link>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>

        <div className="px-3">
          <ThemeToggle />
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
