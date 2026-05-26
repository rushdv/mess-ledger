"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meals", label: "Meal Count", icon: UtensilsCrossed },
  { href: "/bazar", label: "Bazar Cost", icon: ShoppingBasket },
  { href: "/utility", label: "Utility", icon: Zap, adminOnly: true },
  { href: "/individual-cost", label: "Individual Cost", icon: Receipt, adminOnly: true },
  { href: "/shared-cost", label: "Shared Cost", icon: Share2, adminOnly: true },
  { href: "/payments", label: "Payments", icon: CreditCard, adminOnly: true },
  { href: "/report", label: "Report", icon: BarChart3 },
  { href: "/members", label: "Members", icon: Users, adminOnly: true },
  { href: "/help", label: "Help & Guide", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { messContext } = useMessContext();
  
  // Use mess-specific role, not global role
  const canManage = messContext?.canManage ?? false;

  return (
    // Hidden on mobile, visible on md+
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">MessLedger</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          if (item.adminOnly && !canManage) return null;
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-3 space-y-2">
        {/* Switch Mess Button */}
        <Link
          href="/select-mess"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Building2 className="h-4 w-4" />
          Switch Mess
        </Link>
        
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session?.user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
