import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMonthly } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  UtensilsCrossed,
  ShoppingBasket,
  Zap,
  TrendingDown,
  TrendingUp,
  Users,
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

  // Find current user's summary
  const member = await prisma.member.findUnique({
    where: { userId: session!.user.id },
  });

  const mySummary = member
    ? calc.memberSummaries.find((s) => s.memberId === member.id)
    : null;

  const stats = [
    {
      title: "Total Meals",
      value: calc.totalMeals.toString(),
      icon: UtensilsCrossed,
      description: `Meal rate: ${formatCurrency(calc.mealRate)}/meal`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Bazar Cost",
      value: formatCurrency(calc.totalBazarCost),
      icon: ShoppingBasket,
      description: `${getMonthName(month)} ${year}`,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Utility Cost",
      value: formatCurrency(calc.totalUtility),
      icon: Zap,
      description: `${formatCurrency(calc.utilityPerHead)}/member`,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Active Members",
      value: memberCount.toString(),
      icon: Users,
      description: "Currently active",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {getMonthName(month)} {year} overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* My summary */}
      {mySummary && (
        <Card>
          <CardHeader>
            <CardTitle>My Summary — {getMonthName(month)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">My Meals</p>
                <p className="text-xl font-semibold">{mySummary.totalMeals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meal Cost</p>
                <p className="text-xl font-semibold">{formatCurrency(mySummary.mealCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-semibold">{formatCurrency(mySummary.totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due / Advance</p>
                <div className="flex items-center gap-1">
                  {mySummary.due > 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <p
                    className={`text-xl font-semibold ${
                      mySummary.due > 0 ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(mySummary.due))}
                    {mySummary.due < 0 && " (advance)"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All members due summary (admin) */}
      {session?.user.role === "ADMIN" && calc.memberSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Member Dues — {getMonthName(month)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calc.memberSummaries.map((s) => (
                <div
                  key={s.memberId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{s.memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.totalMeals} meals · paid {formatCurrency(s.totalPaid)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        s.due > 0 ? "text-destructive" : "text-green-600"
                      }`}
                    >
                      {s.due > 0 ? "Owes " : "Advance "}
                      {formatCurrency(Math.abs(s.due))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(s.totalCost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
