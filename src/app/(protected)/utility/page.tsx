"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const UTILITY_TYPES = ["ELECTRICITY", "GAS", "WATER", "INTERNET", "OTHER"] as const;
type UtilityType = (typeof UTILITY_TYPES)[number];

const typeColors: Record<UtilityType, string> = {
  ELECTRICITY: "bg-yellow-100 text-yellow-800",
  GAS: "bg-blue-100 text-blue-800",
  WATER: "bg-cyan-100 text-cyan-800",
  INTERNET: "bg-purple-100 text-purple-800",
  OTHER: "bg-gray-100 text-gray-800",
};

interface UtilityEntry {
  id: string;
  type: UtilityType;
  amount: number;
  description: string | null;
  createdAt: string;
}

export default function UtilityPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<UtilityEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "ELECTRICITY" as UtilityType, amount: "", description: "" });
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/utility?month=${month}&year=${year}`);
    const data = await res.json();
    setEntries(data);
  }, [month, year]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  // Group by type
  const byType = UTILITY_TYPES.reduce(
    (acc, t) => {
      acc[t] = entries.filter((e) => e.type === t).reduce((s, e) => s + e.amount, 0);
      return acc;
    },
    {} as Record<UtilityType, number>
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/utility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description || null,
      }),
    });
    if (res.ok) {
      setForm({ type: "ELECTRICITY", amount: "", description: "" });
      setOpen(false);
      fetchEntries();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/utility?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Utility Costs</h1>
          <p className="text-muted-foreground">Electricity, gas, water, internet</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPicker
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y); }}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Utility Cost</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((p) => ({ ...p, type: v as UtilityType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UTILITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-amount">Amount (৳)</Label>
                  <Input
                    id="u-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-desc">Description (optional)</Label>
                  <Input
                    id="u-desc"
                    placeholder="e.g. May electricity bill"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Entry"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-yellow-50 p-3">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Utility</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            </div>
          </CardContent>
        </Card>
        {UTILITY_TYPES.filter((t) => byType[t] > 0).map((t) => (
          <Card key={t}>
            <CardContent className="pt-6">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[t]}`}>
                {t}
              </span>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(byType[t])}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No utility entries yet.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[entry.type]}`}>
                      {entry.type}
                    </span>
                    <div>
                      <p className="font-medium">{formatCurrency(entry.amount)}</p>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
