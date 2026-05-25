"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, ShoppingBasket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BazarEntry {
  id: string;
  month: number;
  year: number;
  amount: number;
  description: string | null;
  date: string;
}

export default function BazarPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<BazarEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", description: "" });
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/bazar?month=${month}&year=${year}`);
    setEntries(await res.json());
  }, [month, year]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/bazar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, amount: parseFloat(form.amount), description: form.description || null }),
    });
    if (res.ok) { setForm({ amount: "", description: "" }); setOpen(false); fetchEntries(); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/bazar?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-5">
      {/* Month picker */}
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
            <DialogHeader>
              <DialogTitle>Add Bazar Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (৳)</Label>
                <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (optional)</Label>
                <Input id="desc" placeholder="e.g. Weekly grocery"
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
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2.5">
            <ShoppingBasket className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm opacity-80">Total Bazar Cost</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs opacity-70">{entries.length} entries</p>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Entries</p>
        </div>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBasket className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No entries yet</p>
            <p className="text-xs text-muted-foreground">Tap Add to record bazar cost</p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <ShoppingBasket className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
