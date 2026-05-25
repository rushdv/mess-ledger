import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMonthly } from "@/lib/calculations";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  UtensilsCrossed, ShoppingBasket, Zap, TrendingDown, TrendingUp, Users, Wallet,
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

  const member = await prisma.member.findUnique({ where: { userId: session!.user.id } });
  const mySummary = member ? calc.memberSummaries.find((s) => s.memberId === member.id) : null;

  return (
    <div className="space-y-6">
      {/* Page title — desktop only */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{getMonthName(month)} {year} overview</p>
      </div>

      {/* ── Desktop: 5-stat grid ── */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-4">
        {[
          { label: "Total Cost", value: formatCurrency(calc.totalCost), icon: ShoppingBasket, color: "text-primary", bg: "bg-primary/10", desc: `${getMonthName(month)} ${year}` },
          { label: "Total Meals", value: calc.totalMeals.toString(), icon: UtensilsCrossed, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950", desc: `৳${calc.mealRate.toFixed(2)}/meal` },
          { label: "Bazar Cost", value: formatCurrency(calc.totalBazarCost), icon: ShoppingBasket, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950", desc: "Grocery expenses" },
          { label: "Utility", value: formatCurrency(calc.totalUtility), icon: Zap, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950", desc: `${formatCurrency(calc.utilityPerHead)}/member` },
          {
            label: "Mess Balance",
            value: (calc.messBalance >= 0 ? "+" : "") + formatCurrency(calc.messBalance),
            icon: Wallet,
            color: calc.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            bg: calc.messBalance >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950",
            desc: calc.messBalance >= 0 ? "Surplus" : "Deficit",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <div className={`rounded-lg p-2 ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <p className={`mt-3 text-2xl font-bold ${s.label === "Mess Balance" ? s.color : ""}`}>{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: two-column layout ── */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6">
        {/* Left: member dues table */}
        {session?.user.role === "ADMIN" && calc.memberSummaries.length > 0 && (
          <div className="md:col-span-2 rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Member Dues — {getMonthName(month)}</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Meals</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cost</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Paid</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {calc.memberSummaries.map((s) => (
                  <tr key={s.memberId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {s.memberName[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{s.memberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{s.totalMeals}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(s.totalCost)}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(s.totalPaid)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${s.due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                        {s.due > 0 ? "-" : "+"}{formatCurrency(Math.abs(s.due))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td className="px-5 py-3 font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-semibold">{calc.totalMeals}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(calc.totalCost)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(calc.memberSummaries.reduce((s, m) => s + m.totalPaid, 0))}
                  </td>
                  <td className="px-5 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Right: my summary + quick stats */}
        <div className="space-y-4">
          {mySummary && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-4 font-semibold">My Summary</h2>
              <div className="space-y-3">
                {[
                  { label: "My Meals", value: mySummary.totalMeals.toString() },
                  { label: "Meal Cost", value: formatCurrency(mySummary.mealCost) },
                  { label: "Utility Share", value: formatCurrency(mySummary.utilityShare) },
                  ...(mySummary.individualCost > 0 ? [{ label: "Individual Cost", value: formatCurrency(mySummary.individualCost) }] : []),
                  { label: "Total Cost", value: formatCurrency(mySummary.totalCost) },
                  { label: "Paid", value: formatCurrency(mySummary.totalPaid) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{mySummary.due > 0 ? "You Owe" : "Advance"}</span>
                    <span className={`text-lg font-bold ${mySummary.due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                      {formatCurrency(Math.abs(mySummary.due))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Mess Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> Active Members
                </div>
                <span className="font-semibold">{memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meal Rate</span>
                <span className="font-semibold">{formatCurrency(calc.mealRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utility/Head</span>
                <span className="font-semibold">{formatCurrency(calc.utilityPerHead)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" /> Mess Balance
                </div>
                <span className={`font-bold text-base ${calc.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {calc.messBalance >= 0 ? "+" : ""}{formatCurrency(calc.messBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout (hidden on md+)
      ══════════════════════════════════════════ */}
      <div className="space-y-5 md:hidden">
        {/* Hero card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-primary-foreground">
          <p className="text-sm font-medium opacity-80">{getMonthName(month)} {year}</p>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(calc.totalCost)}</p>
          <p className="mt-1 text-sm opacity-80">Total mess cost this month</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs opacity-80">Meal Rate</p>
              <p className="mt-0.5 text-lg font-semibold">{formatCurrency(calc.mealRate)}</p>
              <p className="text-xs opacity-70">per meal</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs opacity-80">Total Meals</p>
              <p className="mt-0.5 text-lg font-semibold">{calc.totalMeals}</p>
              <p className="text-xs opacity-70">{memberCount} members</p>
            </div>
          </div>
        </div>

        {/* Mess Balance card */}
        <div className={`rounded-2xl border p-4 ${calc.messBalance >= 0 ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${calc.messBalance >= 0 ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
                <Wallet className={`h-5 w-5 ${calc.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Mess Balance</p>
                <p className="text-xs text-muted-foreground">{calc.messBalance >= 0 ? "Surplus — mess has extra funds" : "Deficit — mess needs funds"}</p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${calc.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {calc.messBalance >= 0 ? "+" : ""}{formatCurrency(calc.messBalance)}
            </p>
          </div>
        </div>

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
              <div className={`rounded-xl p-3 ${mySummary.due > 0 ? "bg-red-50 dark:bg-red-950/60" : "bg-green-50 dark:bg-green-950/60"}`}>
                <p className="text-xs text-muted-foreground">{mySummary.due > 0 ? "You Owe" : "Advance"}</p>
                <div className="mt-1 flex items-center gap-1">
                  {mySummary.due > 0
                    ? <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />
                    : <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />}
                  <p className={`text-xl font-bold ${mySummary.due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {formatCurrency(Math.abs(mySummary.due))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Bazar", value: formatCurrency(calc.totalBazarCost), icon: ShoppingBasket, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
            { label: "Utility", value: formatCurrency(calc.totalUtility), icon: Zap, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border bg-card p-4">
                <div className={`mb-2 inline-flex rounded-xl p-2 ${s.bg}`}><Icon className={`h-4 w-4 ${s.color}`} /></div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 text-lg font-bold">{s.value}</p>
              </div>
            );
          })}
        </div>

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
                      <p className="text-xs text-muted-foreground">{s.totalMeals} meals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${s.due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                      {s.due > 0 ? "-" : "+"}{formatCurrency(Math.abs(s.due))}
                    </p>
                    <p className="text-xs text-muted-foreground">paid {formatCurrency(s.totalPaid)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
