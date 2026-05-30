"use client";

import { useState, useEffect, useCallback } from "react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, ShoppingBasket, User } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  user: { name: string | null };
}

interface BazarEntry {
  id: string;
  month: number;
  year: number;
  amount: number;
  description: string | null;
  date: string;
  memberId: string | null;
  member: { user: { name: string | null } } | null;
}

export default function BazarPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<BazarEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    memberId: "",
  });
  const [loading, setLoading] = useState(false);
  const { messContext } = useMessContext();

  const canManage = messContext?.canManage ?? false;

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/bazar?month=${month}&year=${year}`);
    setEntries(await res.json());
  }, [month, year]);

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/members");
    if (res.ok) setMembers(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { if (canManage) fetchMembers(); }, [canManage, fetchMembers]);

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
        date: form.date,
        memberId: form.memberId || null,
      }),
    });
    if (res.ok) {
      setForm({ amount: "", description: "", date: new Date().toISOString().split("T")[0], memberId: "" });
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

  const AddDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
        <DialogHeader><DialogTitle>Add Bazar Entry</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bazar-member">Bazar By (Optional)</Label>
            <select
              id="bazar-member"
              className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.memberId}
              onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}
            >
              <option value="">— Select Member —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name ?? "Unknown"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-date">Date</Label>
            <Input
              id="bazar-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-amount">Amount (৳)</Label>
            <Input
              id="bazar-amount"
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
            <Label htmlFor="bazar-desc">Description (optional)</Label>
            <Input
              id="bazar-desc"
              placeholder="e.g. Weekly grocery"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? "Adding..." : "Add Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const EntriesList = (
    <div className="divide-y">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950">
              <ShoppingBasket className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold">{formatCurrency(entry.amount)}</p>
              {entry.member?.user?.name && (
                <p className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <User className="h-3 w-3" />
                  {entry.member.user.name}
                </p>
              )}
              {entry.description && (
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => handleDelete(entry.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400 active:bg-red-100 dark:active:bg-red-900"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP layout ── */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bazar Cost</h1>
            <p className="text-muted-foreground">Track grocery and market expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            {canManage && AddDialog}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: entries table */}
          <div className="col-span-2 rounded-xl border bg-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Entries</h2>
              <span className="text-sm text-muted-foreground">{entries.length} records</span>
            </div>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBasket className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No entries yet</p>
                <p className="text-sm text-muted-foreground">Click Add Entry to get started</p>
              </div>
            ) : EntriesList}
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <ShoppingBasket className="h-5 w-5" />
              </div>
              <p className="text-sm opacity-80">Total Bazar Cost</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="mt-1 text-xs opacity-70">{entries.length} entries this month</p>
            </div>
            {entries.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average per entry</span>
                    <span className="font-medium">{formatCurrency(total / entries.length)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Largest entry</span>
                    <span className="font-medium">{formatCurrency(Math.max(...entries.map((e) => e.amount)))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="space-y-5 md:hidden">
        <div className="flex flex-col gap-3">
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          {canManage && AddDialog}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5"><ShoppingBasket className="h-5 w-5" /></div>
            <div>
              <p className="text-sm opacity-80">Total Bazar Cost</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="text-xs opacity-70">{entries.length} entries</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3"><p className="font-semibold">Entries</p></div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBasket className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No entries yet</p>
              <p className="text-xs text-muted-foreground">Tap Add Entry to record bazar cost</p>
            </div>
          ) : EntriesList}
        </div>
      </div>
    </>
  );
}
