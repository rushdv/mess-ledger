"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, Zap, Droplets, Flame, Wifi, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const UTILITY_TYPES = ["ELECTRICITY", "GAS", "WATER", "INTERNET", "DUST", "OTHER"] as const;
type UtilityType = (typeof UTILITY_TYPES)[number];

const typeConfig: Record<UtilityType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ELECTRICITY: { label: "Electricity", icon: Zap,           color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950" },
  GAS:         { label: "Gas",         icon: Flame,         color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
  WATER:       { label: "Water",       icon: Droplets,      color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950"     },
  INTERNET:    { label: "Internet",    icon: Wifi,          color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950" },
  DUST:        { label: "Dust Bill",   icon: Trash2,        color: "text-green-600 dark:text-green-400",   bg: "bg-green-50 dark:bg-green-950"   },
  OTHER:       { label: "Other",       icon: MoreHorizontal,color: "text-gray-600 dark:text-gray-400",     bg: "bg-gray-100 dark:bg-gray-800"    },
};

interface UtilityEntry {
  id: string;
  type: UtilityType;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
}

export default function UtilityPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<UtilityEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    type: "ELECTRICITY" as UtilityType, 
    amount: "", 
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/utility?month=${month}&year=${year}`);
    setEntries(await res.json());
  }, [month, year]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const total = Math.round(entries.reduce((sum, e) => sum + Number(e.amount), 0) * 100) / 100;
  const byType = UTILITY_TYPES.reduce((acc, t) => {
    acc[t] = Math.round(entries.filter((e) => e.type === t).reduce((s, e) => s + Number(e.amount), 0) * 100) / 100;
    return acc;
  }, {} as Record<UtilityType, number>);

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
        date: form.date
      }),
    });
    if (res.ok) { 
      setForm({ 
        type: "ELECTRICITY", 
        amount: "", 
        description: "",
        date: new Date().toISOString().split('T')[0]
      }); 
      setOpen(false); 
      fetchEntries(); 
      toast.success("Utility entry added");
    } else {
      const err = await res.json().catch(() => ({ error: "Failed to add utility entry" }));
      toast.error(err.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/utility?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchEntries();
      toast.success("Utility entry deleted");
    } else {
      const err = await res.json().catch(() => ({ error: "Failed to delete entry" }));
      toast.error(err.error);
    }
  }

  const AddDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl"><Plus className="mr-1.5 h-4 w-4" />Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
        <DialogHeader><DialogTitle>Add Utility Cost</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u-date">Date</Label>
            <Input 
              id="u-date" 
              type="date" 
              value={form.date} 
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} 
              required 
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as UtilityType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UTILITY_TYPES.map((t) => <SelectItem key={t} value={t}>{typeConfig[t].label}</SelectItem>)}</SelectContent>
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
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>{loading ? "Adding..." : "Add Entry"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const EntriesList = (
    <div className="divide-y">
      {entries.map((entry) => {
        const cfg = typeConfig[entry.type];
        const Icon = cfg.icon;
        return (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(entry.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
              aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Utility Costs</h1>
            <p className="text-muted-foreground">Electricity, gas, water, internet</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            {AddDialog}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-xl border bg-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Entries</h2>
              <span className="text-sm text-muted-foreground">{entries.length} records</span>
            </div>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Zap className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No utility entries yet</p>
              </div>
            ) : EntriesList}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 p-5 text-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-sm opacity-80">Total Utility</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
            </div>
            {UTILITY_TYPES.some((t) => byType[t] > 0) && (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">By Type</p>
                {UTILITY_TYPES.filter((t) => byType[t] > 0).map((t) => {
                  const cfg = typeConfig[t];
                  const Icon = cfg.icon;
                  return (
                    <div key={t} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-1.5 ${cfg.bg}`}><Icon className={`h-3.5 w-3.5 ${cfg.color}`} /></div>
                        <span className="text-sm">{cfg.label}</span>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(byType[t])}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="space-y-5 md:hidden">
        <div className="flex flex-col gap-3">
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          {AddDialog}
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5"><Zap className="h-5 w-5" /></div>
            <div>
              <p className="text-sm opacity-80">Total Utility</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
        {UTILITY_TYPES.some((t) => byType[t] > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {UTILITY_TYPES.filter((t) => byType[t] > 0).map((t) => {
              const cfg = typeConfig[t]; const Icon = cfg.icon;
              return (
                <div key={t} className="rounded-2xl border bg-card p-3">
                  <div className={`mb-2 inline-flex rounded-xl p-2 ${cfg.bg}`}><Icon className={`h-4 w-4 ${cfg.color}`} /></div>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  <p className="mt-0.5 text-lg font-bold">{formatCurrency(byType[t])}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3"><p className="font-semibold">Entries</p></div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No utility entries yet</p>
            </div>
          ) : EntriesList}
        </div>
      </div>
    </>
  );
}
