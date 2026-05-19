"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const data = await res.json();
    setEntries(data);
  }, [month, year]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/bazar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        amount: parseFloat(form.amount),
        description: form.description || null,
      }),
    });
    if (res.ok) {
      setForm({ amount: "", description: "" });
      setOpen(false);
      fetchEntries();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/bazar?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bazar Cost</h1>
          <p className="text-muted-foreground">Track grocery and market expenses</p>
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
                <DialogTitle>Add Bazar Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
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
                  <Label htmlFor="desc">Description (optional)</Label>
                  <Input
                    id="desc"
                    placeholder="e.g. Weekly grocery"
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

      {/* Summary card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-full bg-orange-50 p-3">
            <ShoppingBasket className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Bazar Cost</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground">{entries.length} entries</p>
          </div>
        </CardContent>
      </Card>

      {/* Entries list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No entries yet. Add your first bazar cost.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(entry.amount)}</p>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
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
