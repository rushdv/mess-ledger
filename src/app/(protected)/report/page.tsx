"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, getMonthName } from "@/lib/utils";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface MemberSummary {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
  totalCost: number;
  totalPaid: number;
  due: number;
}

interface ReportData {
  month: number;
  year: number;
  totalMeals: number;
  totalBazarCost: number;
  totalUtility: number;
  totalCost: number;
  mealRate: number;
  utilityPerHead: number;
  memberSummaries: MemberSummary[];
}

export default function ReportPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/report?month=${month}&year=${year}`);
    setReport(await res.json());
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  async function handleRecalculate() {
    setRecalculating(true);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    await fetchReport();
    setRecalculating(false);
  }

  const chartData = report?.memberSummaries.map((s) => ({
    name: s.memberName.split(" ")[0],
    "Meal": Math.round(s.mealCost),
    "Utility": Math.round(s.utilityShare),
    "Paid": Math.round(s.totalPaid),
  }));

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        {isAdmin && (
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRecalculate} disabled={recalculating}>
            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />
            Recalc
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : report ? (
        <>
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-primary-foreground">
            <p className="text-sm opacity-80">{getMonthName(month)} {year} — Total Cost</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(report.totalCost)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <p className="text-xs opacity-80">Meal Rate</p>
                <p className="text-lg font-semibold">{formatCurrency(report.mealRate)}</p>
                <p className="text-xs opacity-70">per meal</p>
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <p className="text-xs opacity-80">Total Meals</p>
                <p className="text-lg font-semibold">{report.totalMeals}</p>
                <p className="text-xs opacity-70">{report.memberSummaries.length} members</p>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Bazar Cost</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(report.totalBazarCost)}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Utility Cost</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(report.totalUtility)}</p>
            </div>
          </div>

          {/* Chart */}
          {chartData && chartData.length > 0 && (
            <div className="rounded-2xl border bg-card p-4">
              <p className="mb-3 font-semibold">Cost Breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Meal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Utility" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Member cards */}
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-4 py-3">
              <p className="font-semibold">Member Summary</p>
            </div>
            <div className="divide-y">
              {report.memberSummaries.map((s) => (
                <div key={s.memberId} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {s.memberName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{s.memberName}</p>
                        <p className="text-xs text-muted-foreground">{s.totalMeals} meals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 font-bold ${s.due > 0 ? "text-red-600" : "text-green-600"}`}>
                        {s.due > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {formatCurrency(Math.abs(s.due))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.due > 0 ? "owes" : "advance"}
                      </p>
                    </div>
                  </div>
                  {/* Detail row */}
                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Meal</p>
                      <p className="text-sm font-semibold">{formatCurrency(s.mealCost)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Utility</p>
                      <p className="text-sm font-semibold">{formatCurrency(s.utilityShare)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(s.totalPaid)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
