"use client";

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { UtensilsCrossed } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/meals": "Meal Count",
  "/bazar": "Bazar Cost",
  "/utility": "Utility",
  "/individual-cost": "Individual Cost",
  "/shared-cost": "Shared Cost",
  "/payments": "Payments",
  "/report": "Report",
  "/members": "Members",
  "/more": "More",
};

export function TopBar() {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.user;
  const title = pageTitles[pathname] ?? "MessLedger";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
