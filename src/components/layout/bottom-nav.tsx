"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessContext } from "@/hooks/use-mess-context";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBasket,
  BarChart3,
  MoreHorizontal,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Bottom nav shows the 4 most important items + "More" for the rest
const primaryNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/bazar", label: "Bazar", icon: ShoppingBasket },
  { href: "/requests", label: "Requests", icon: ClipboardList, showBadge: true },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const { messContext } = useMessContext();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/requests/count");
        if (res.ok) {
          const data = await res.json();
          setRequestCount(data.total);
        }
      } catch (e) {
        console.error("Failed to fetch request count", e);
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 120000);
    return () => clearInterval(interval);
  }, []);

  const items = primaryNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.href === "/more"
              ? ["/utility", "/payments", "/members", "/individual-cost", "/shared-cost", "/more", "/help", "/select-mess"].includes(pathname)
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span>{item.label}</span>
              {item.showBadge && requestCount > 0 && (
                <span className="absolute right-3 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  {requestCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
