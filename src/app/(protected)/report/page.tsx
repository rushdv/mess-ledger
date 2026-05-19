"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, getMonthName } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
    const data = await res.json();
    setReport(data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
    "Meal Cost": Math.round(s.mealCost),
    "Utility Share": Math.round(s.utilityShare),
    Paid: Math.round(s.totalPaid),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly Report</h1>
          <p className="text-muted-foreground">Full breakdown of costs and dues</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPicker
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y); }}
          />
          {isAdmin && (
            <Button variant="outline" onClick={handleRecalculate} disabled={recalculating}>
              <RefreshCw className={`mr-1 h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
              Recalculate
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Meals", value: report.totalMeals.toString() },
              { label: "Meal Rate", value: `${formatCurrency(report.mealRate)}/meal` },
              { label: "Bazar Cost", value: formatCurrency(report.totalBazarCost) },
              { label: "Utility Cost", value: formatCurrency(report.totalUtility) },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          {chartData && chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Cost Breakdown — {getMonthName(month)} {year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Bar dataKey="Meal Cost" fill="#3b82f6" />
                    <Bar dataKey="Utility Share" fill="#f59e0b" />
                    <Bar dataKey="Paid" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Member table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Member Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Meals</TableHead>
                    <TableHead className="text-right">Meal Cost</TableHead>
                    <TableHead className="text-right">Utility</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Due / Advance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.memberSummaries.map((s) => (
                    <TableRow key={s.memberId}>
                      <TableCell className="font-medium">{s.memberName}</TableCell>
                      <TableCell className="text-right">{s.totalMeals}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.mealCost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.utilityShare)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.totalCost)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(s.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end gap-1 font-semibold ${
                            s.due > 0 ? "text-destructive" : "text-green-600"
                          }`}
                        >
                          {s.due > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(Math.abs(s.due))}
                          {s.due < 0 && " ↑"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{report.totalMeals}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.totalBazarCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.totalUtility)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(
                        report.memberSummaries.reduce((s, m) => s + m.totalPaid, 0)
                      )}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
