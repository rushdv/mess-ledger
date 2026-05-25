"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Zap, CreditCard, Users, LogOut, ChevronRight } from "lucide-react";

const adminItems = [
  { href: "/utility", label: "Utility Costs", icon: Zap, description: "Electricity, gas, water, internet", color: "bg-yellow-50 text-yellow-600" },
  { href: "/payments", label: "Payments", icon: CreditCard, description: "Record member deposits", color: "bg-green-50 text-green-600" },
  { href: "/members", label: "Members", icon: Users, description: "Manage mess members", color: "bg-purple-50 text-purple-600" },
];

export default function MorePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-lg font-semibold">{session?.user?.name}</p>
            <p className="text-sm opacity-80">{session?.user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {session?.user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Admin menu items */}
      {isAdmin && (
        <div>
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin Tools
          </p>
          <div className="overflow-hidden rounded-2xl border bg-card">
            {adminItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 active:bg-muted ${
                    i < adminItems.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-4 p-4 text-destructive transition-colors hover:bg-destructive/5 active:bg-destructive/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
