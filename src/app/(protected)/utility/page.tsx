"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Zap, Droplets, Flame, Wifi, MoreHorizontal } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const UTILITY_TYPES = ["ELECTRICITY", "GAS", "WATER", "INTERNET", "OTHER"] as const;
type UtilityType = (typeof UTILITY_TYPES)[number];

const typeConfig: Record<UtilityType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ELECTRICITY: { label: "Electricity", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
  GAS:         { label: "Gas",         icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
  WATER:       { label: "Water",       icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
  INTERNET:    { label: "Internet",    icon: Wifi, color: "text-purple-600", bg: "bg-purple-50" },
  OTHER:       { label: "Other",       icon: MoreHorizontal, color: "text-gray-600", bg: "bg-gray-100" },
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
    setEntries(await res.json());
  }, [month, year]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  const byType = UTILITY_TYPES.reduce((acc, t) => {
    acc[t] = entries.filter((e) => e.type === t).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {} as Record<UtilityType, number>);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/utility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, type: form.type, amount: parseFloat(form.amount), description: form.description || null }),
    });
    if (res.ok) { setForm({ type: "ELECTRICITY", amount: "", description: "" }); setOpen(false); fetchEntries(); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/utility?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-5">
      {/* Month picker + add */}
      <div className="flex items-center justify-between">
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
            <DialogHeader><DialogTitle>Add Utility Cost</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as UtilityType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UTILITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{typeConfig[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-amount">Amount (৳)</Label>
                <Input id="u-amount" type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-desc">Description (optional)</Label>
                <Input id="u-desc" placeholder="e.g. May electricity bill"
                  value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Adding..." : "Add Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero total */}
      <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2.5">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm opacity-80">Total Utility</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      {UTILITY_TYPES.some((t) => byType[t] > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {UTILITY_TYPES.filter((t) => byType[t] > 0).map((t) => {
            const cfg = typeConfig[t];
            const Icon = cfg.icon;
            return (
              <div key={t} className="rounded-2xl border bg-card p-3">
                <div className={`mb-2 inline-flex rounded-xl p-2 ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <p className="mt-0.5 text-lg font-bold">{formatCurrency(byType[t])}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Entries list */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Entries</p>
        </div>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No utility entries yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => {
              const cfg = typeConfig[entry.type];
              const Icon = cfg.icon;
              return (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                      <p className="text-xs text-muted-foreground">{cfg.label}</p>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
