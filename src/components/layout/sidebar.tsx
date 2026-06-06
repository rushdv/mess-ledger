"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useMessContext } from "@/hooks/use-mess-context";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBasket,
  Zap,
  CreditCard,
  BarChart3,
  Users,
  Receipt,
  Share2,
  LogOut,
  Building2,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { href: "/meals", label: "Meal Count", icon: UtensilsCrossed, section: "Main" },
  { href: "/bazar", label: "Bazar Cost", icon: ShoppingBasket, section: "Main" },
  { href: "/requests", label: "Requests", icon: ClipboardList, section: "Main", showBadge: true },
  { href: "/report", label: "Report", icon: BarChart3, section: "Main" },
  { href: "/help", label: "Help & Guide", icon: BookOpen, section: "Support" },
  { href: "/utility", label: "Utility", icon: Zap, adminOnly: true, section: "Management" },
  { href: "/individual-cost", label: "Individual Cost", icon: Receipt, adminOnly: true, section: "Management" },
  { href: "/shared-cost", label: "Shared Cost", icon: Share2, adminOnly: true, section: "Management" },
  { href: "/payments", label: "Payments", icon: CreditCard, adminOnly: true, section: "Management" },
  { href: "/members", label: "Members", icon: Users, adminOnly: true, section: "Management" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const session = data?.user;
  const { messContext } = useMessContext();
  const [requestCount, setRequestCount] = useState(0);

  const canManage = messContext?.canManage ?? false;

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/requests/count");
        if (res.ok) {
          const json = await res.json();
          setRequestCount(json.total);
        }
      } catch {
        // ignore
      }
    }
    if (data) fetchCount();
    const interval = setInterval(fetchCount, 120000);
    return () => clearInterval(interval);
  }, [data]);

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  }

  const sections = ["Main", "Management", "Support"];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-lg font-bold">MessLedger</span>
          {messContext && (
            <p className="truncate text-xs text-muted-foreground">{messContext.messName}</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sections.map((section) => {
          const sectionItems = navItems.filter(
            (item) => item.section === section && (!item.adminOnly || canManage)
          );
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="mb-6">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section}
              </p>
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </div>
                      {item.showBadge && requestCount > 0 && (
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                            isActive
                              ? "bg-white text-primary"
                              : "bg-primary text-primary-foreground shadow-sm"
                          )}
                        >
                          {requestCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-3 space-y-2">
        <Link
          href="/select-mess"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Building2 className="h-4 w-4" />
          Switch Mess
        </Link>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {session?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.email}</p>
          </div>
        </div>

        <div className="px-3 pb-1">
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
