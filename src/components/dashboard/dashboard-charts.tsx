"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

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

interface DashboardChartsProps {
  totalBazarCost: number;
  totalUtility: number;
  totalIndividual: number;
  totalShared: number;
  totalCost: number;
  totalCollected: number;
  memberSummaries: MemberSummary[];
}

export function DashboardCharts({
  totalBazarCost,
  totalUtility,
  totalIndividual,
  totalShared,
  totalCost,
  totalCollected,
  memberSummaries,
}: DashboardChartsProps) {
  // 1. Data for Expense Breakdown
  const expenseData = [
    { name: "Bazar Cost", value: totalBazarCost, color: "#f97316" }, // Orange
    { name: "Utility Cost", value: totalUtility, color: "#eab308" }, // Yellow
    { name: "Individual Cost", value: totalIndividual, color: "#a855f7" }, // Purple
    { name: "Shared Cost", value: totalShared, color: "#06b6d4" }, // Cyan
  ].filter((item) => item.value > 0);

  // 2. Data for Cashflow Comparison
  const cashflowData = [
    {
      name: "Financials",
      Collected: totalCollected,
      Costs: totalCost,
    },
  ];

  // 3. Data for Meal Distribution
  const mealData = memberSummaries.map((s) => ({
    name: s.memberName.split(" ")[0] || s.memberName, // Short name
    Meals: s.totalMeals,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border bg-background p-3 shadow-md text-xs">
          <p className="font-semibold mb-1">{label || payload[0].name}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color || p.fill }} className="font-medium">
              {p.name}: {p.name.includes("Meals") ? p.value : formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Upper Grid: Expense Breakdown & Cashflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown (Pie Chart) */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Expense Breakdown</h3>
            <p className="text-xs text-muted-foreground">Distribution of costs this month</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">No expenses recorded yet</div>
            )}
          </div>
        </div>

        {/* Cashflow Comparison (Bar Chart) */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Mess Cashflow</h3>
            <p className="text-xs text-muted-foreground">Total collections vs total costs</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="rect" />
                <Bar dataKey="Collected" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Costs" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Meal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Meal Distribution</h3>
            <p className="text-xs text-muted-foreground">Total meals consumed per member</p>
          </div>
          <div className="h-72">
            {mealData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Meals" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No meal data found for this month
              </div>
            )}
          </div>
        </div>

        {/* Member Balances (Line Chart) */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Member Balances Trend</h3>
            <p className="text-xs text-muted-foreground">Total Cost vs Total Paid by member</p>
          </div>
          <div className="h-72">
            {memberSummaries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberSummaries.map(s => ({ name: s.memberName.split(" ")[0], Cost: s.totalCost, Paid: s.totalPaid }))} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Paid" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
