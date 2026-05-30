"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Zap, CreditCard, Users, LogOut, ChevronRight, Receipt, Share2, Sun, Moon, Monitor, Building2, BookOpen, Flame } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const adminItems = [
  { href: "/utility", label: "Utility Costs", icon: Zap, description: "Electricity, gas, water, internet", color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  { href: "/individual-cost", label: "Individual Cost", icon: Receipt, description: "Personal charges per member", color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  { href: "/shared-cost", label: "Shared Cost", icon: Share2, description: "Split cost among selected members", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { href: "/payments", label: "Payments", icon: CreditCard, description: "Record member deposits", color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { href: "/members", label: "Members", icon: Users, description: "Manage mess members", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
];

const themeOptions = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "orange", icon: Flame, label: "Orange" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export default function MorePage() {
  const { data: session } = useSession();
  const { messContext } = useMessContext();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Use mess-specific role
  const canManage = messContext?.canManage ?? false;
  const isMessAdmin = messContext?.isMessAdmin ?? false;

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
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium uppercase">
              {messContext?.userRole || "MEMBER"}
            </span>
          </div>
        </div>
      </div>

      {/* Theme selector */}
      <div>
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>
        <div className="overflow-hidden rounded-2xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Theme</p>
          {mounted && (
            <div className="grid grid-cols-4 gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors ${
                    theme === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin menu items */}
      {canManage && (
        <div>
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isMessAdmin ? "Admin Tools" : "Moderator Tools"}
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
        <Link
          href="/help"
          className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50 active:bg-muted border-b"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Help & Guide</p>
            <p className="text-sm text-muted-foreground">Learn how to use Mess Ledger</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        
        <Link
          href="/select-mess"
          className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50 active:bg-muted border-b"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Switch Mess</p>
            <p className="text-sm text-muted-foreground">Change or create a new mess</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        
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
