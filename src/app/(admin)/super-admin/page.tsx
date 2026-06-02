"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Activity, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";

interface Stats {
  totalUsers: number;
  totalMesses: number;
  activeMesses: number;
  inactiveMesses: number;
  newUsers: number;
  newMesses: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          throw new Error("Failed to load statistics");
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === "SUPER_ADMIN") {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error || !stats) {
    return <div className="text-destructive p-4 border border-destructive/50 rounded-lg bg-destructive/10">{error || "Failed to load"}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform statistics and metrics for MessLedger.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsers} in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMesses}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newMesses} in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Messes</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMesses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactiveMesses} inactive messes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">System Status</CardTitle>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <p className="text-xs text-primary/80">
              All services running normally
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Check the <a href="/super-admin/audit-logs" className="text-primary hover:underline">Audit Logs</a> for detailed system events and administrative actions.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
