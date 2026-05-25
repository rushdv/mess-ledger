import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMonthly } from "@/lib/calculations";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  UtensilsCrossed,
  ShoppingBasket,
  Zap,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [calc, memberCount] = await Promise.all([
    calculateMonthly(month, year),
    prisma.member.count({ where: { isActive: true } }),
  ]);

  const member = await prisma.member.findUnique({
    where: { userId: session!.user.id },
  });

  const mySummary = member
    ? calc.memberSummaries.find((s) => s.memberId === member.id)
    : null;

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-primary-foreground">
        <p className="text-sm font-medium opacity-80">
          {getMonthName(month)} {year}
        </p>
        <p className="mt-1 text-3xl font-bold">
          {formatCurrency(calc.totalCost)}
        </p>
        <p className="mt-1 text-sm opacity-80">Total mess cost this month</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs opacity-80">Meal Rate</p>
            <p className="mt-0.5 text-lg font-semibold">
              {formatCurrency(calc.mealRate)}
            </p>
            <p className="text-xs opacity-70">per meal</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs opacity-80">Total Meals</p>
            <p className="mt-0.5 text-lg font-semibold">{calc.totalMeals}</p>
            <p className="text-xs opacity-70">{memberCount} members</p>
          </div>
        </div>
      </div>

      {/* My summary */}
      {mySummary && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">My Summary</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">My Meals</p>
              <p className="mt-1 text-xl font-bold">{mySummary.totalMeals}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Meal Cost</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(mySummary.mealCost)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(mySummary.totalCost)}</p>
            </div>
            <div
              className={`rounded-xl p-3 ${
                mySummary.due > 0 ? "bg-red-50" : "bg-green-50"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {mySummary.due > 0 ? "You Owe" : "Advance"}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {mySummary.due > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
                <p
                  className={`text-xl font-bold ${
                    mySummary.due > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(Math.abs(mySummary.due))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Bazar",
            value: formatCurrency(calc.totalBazarCost),
            icon: ShoppingBasket,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Utility",
            value: formatCurrency(calc.totalUtility),
            icon: Zap,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border bg-card p-4">
              <div className={`mb-2 inline-flex rounded-xl p-2 ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Admin: member dues */}
      {session?.user.role === "ADMIN" && calc.memberSummaries.length > 0 && (
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3">
            <p className="font-semibold">Member Dues</p>
            <p className="text-xs text-muted-foreground">{getMonthName(month)} {year}</p>
          </div>
          <div className="divide-y">
            {calc.memberSummaries.map((s) => (
              <div key={s.memberId} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {s.memberName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.totalMeals} meals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      s.due > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {s.due > 0 ? "-" : "+"}{formatCurrency(Math.abs(s.due))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    paid {formatCurrency(s.totalPaid)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
