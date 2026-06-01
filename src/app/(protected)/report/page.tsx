"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMessContext } from "@/hooks/use-mess-context";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, getMonthName } from "@/lib/utils";
import { exportReportToPDF } from "@/lib/pdf-export";
import { RefreshCw, TrendingUp, TrendingDown, Download, FileSpreadsheet } from "lucide-react";
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
  individualCost: number;
  sharedCost: number;
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
  totalIndividual: number;
  totalShared: number;
  totalCost: number;
  totalCollected: number;
  messBalance: number;
  mealRate: number;
  utilityPerHead: number;
  memberSummaries: MemberSummary[];
}

export default function ReportPage() {
  const { data: session } = useSession();
  const { messContext } = useMessContext();
  const canManage = messContext?.canManage ?? false;
  const messName = messContext?.messName || "Mess";

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

  function handleExportPDF() {
    if (report) {
      exportReportToPDF(report, messName);
    }
  }

  function handleExportExcel() {
    window.location.href = `/api/export?month=${month}&year=${year}`;
  }

  const chartData = report?.memberSummaries.map((s) => ({
    name: s.memberName.split(" ")[0],
    "Meal": Math.round(s.mealCost),
    "Utility": Math.round(s.utilityShare),
    "Paid": Math.round(s.totalPaid),
  }));

  const Spinner = (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <>
      {/* ── DESKTOP layout ── */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Monthly Report</h1>
            <p className="text-muted-foreground">Full cost breakdown and member dues</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            <Button variant="outline" className="rounded-xl" onClick={handleExportPDF} disabled={!report}>
              <Download className="mr-1.5 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={handleExportExcel} disabled={!report}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              Export Excel
            </Button>
            {canManage && (
              <Button variant="outline" className="rounded-xl" onClick={handleRecalculate} disabled={recalculating}>
                <RefreshCw className={`mr-1.5 h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
                Recalculate
              </Button>
            )}
          </div>
        </div>

        {loading ? Spinner : report ? (
          <>
            {/* 4-stat row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Cost", value: formatCurrency(report.totalCost) },
                { label: "Meal Rate", value: `${formatCurrency(report.mealRate)}/meal` },
                { label: "Bazar Cost", value: formatCurrency(report.totalBazarCost) },
                { label: "Utility Cost", value: formatCurrency(report.totalUtility) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border bg-card p-5">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Mess Balance banner */}
            <div className={`rounded-xl border p-5 flex items-center justify-between ${report.messBalance >= 0 ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800"}`}>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mess Balance</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total Collected ({formatCurrency(report.totalCollected)}) − Total Cost ({formatCurrency(report.totalCost)})
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${report.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {report.messBalance >= 0 ? "+" : ""}{formatCurrency(report.messBalance)}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${report.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {report.messBalance >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>

            {/* Two-column: table + chart */}
            <div className="grid grid-cols-3 gap-6">
              {/* Member summary table */}
              <div className="col-span-2 rounded-xl border bg-card">
                <div className="border-b px-5 py-4">
                  <h2 className="font-semibold">Member Summary — {getMonthName(month)} {year}</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Member</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Meals</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Meal Cost</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Utility</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Individual</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Shared</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Paid</th>
                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.memberSummaries.map((s) => (
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
                        <td className="px-4 py-3 text-right">{formatCurrency(s.mealCost)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(s.utilityShare)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(s.individualCost)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(s.sharedCost)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(s.totalCost)}</td>
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
                      <td className="px-4 py-3 text-right font-semibold">{report.totalMeals}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(report.totalBazarCost)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(report.totalUtility)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(report.totalIndividual ?? 0)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(report.totalShared ?? 0)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(report.totalCost)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(report.totalCollected)}
                      </td>
                      <td className="px-5 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Right: chart */}
              <div className="rounded-xl border bg-card p-5">
                <h2 className="mb-4 font-semibold">Cost Breakdown</h2>
                {chartData && chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
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
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* ── MOBILE layout ── */}
      <div className="space-y-5 md:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExportPDF} disabled={!report}>
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExportExcel} disabled={!report}>
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </Button>
              {canManage && (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRecalculate} disabled={recalculating}>
                  <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {loading ? Spinner : report ? (
          <>
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-5 text-primary-foreground">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Bazar Cost</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(report.totalBazarCost)}</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Utility Cost</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(report.totalUtility)}</p>
              </div>
              {(report.totalIndividual ?? 0) > 0 && (
                <div className="rounded-2xl border bg-card p-4 col-span-2">
                  <p className="text-xs text-muted-foreground">Individual Costs</p>
                  <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(report.totalIndividual ?? 0)}</p>
                </div>
              )}
              {(report.totalShared ?? 0) > 0 && (
                <div className="rounded-2xl border bg-card p-4 col-span-2">
                  <p className="text-xs text-muted-foreground">Shared Costs</p>
                  <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(report.totalShared ?? 0)}</p>
                </div>
              )}
            </div>

            {/* Mess Balance */}
            <div className={`rounded-2xl border p-4 ${report.messBalance >= 0 ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Mess Balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Collected − Cost</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${report.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {report.messBalance >= 0 ? "+" : ""}{formatCurrency(report.messBalance)}
                  </p>
                  <p className={`text-xs font-medium ${report.messBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {report.messBalance >= 0 ? "Surplus" : "Deficit"}
                  </p>
                </div>
              </div>
            </div>

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

            <div className="rounded-2xl border bg-card">
              <div className="border-b px-4 py-3"><p className="font-semibold">Member Summary</p></div>
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
                        <p className="text-xs text-muted-foreground">{s.due > 0 ? "owes" : "advance"}</p>
                      </div>
                    </div>
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
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(s.totalPaid)}</p>
                      </div>
                      {s.individualCost > 0 && (
                        <div className="text-center col-span-3 border-t pt-2 mt-1">
                          <p className="text-xs text-muted-foreground">Individual</p>
                          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(s.individualCost)}</p>
                        </div>
                      )}
                      {s.sharedCost > 0 && (
                        <div className="text-center col-span-3 border-t pt-2 mt-1">
                          <p className="text-xs text-muted-foreground">Shared</p>
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(s.sharedCost)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
