"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsData {
  growthData: { name: string; users: number; messes: number }[];
  activityData: { name: string; value: number; fill: string }[];
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === "SUPER_ADMIN") {
      fetchAnalytics();
    }
  }, [session]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-muted-foreground p-4">Failed to load analytics data.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Growth and activity trends across the application.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Platform Growth</CardTitle>
            </div>
            <CardDescription>User and Mess registration trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMesses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                  <Area type="monotone" dataKey="messes" stroke="#10b981" fillOpacity={1} fill="url(#colorMesses)" name="Total Messes" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mess Activity</CardTitle>
            <CardDescription>Active vs Inactive workspaces in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
