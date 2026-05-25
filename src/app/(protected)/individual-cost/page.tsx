"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, Receipt, User } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  user: { name: string | null; email: string };
}

interface IndividualCostEntry {
  id: string;
  memberId: string;
  amount: number;
  description: string | null;
  createdAt: string;
  member: { user: { name: string | null; email: string } };
}

export default function IndividualCostPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<IndividualCostEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    memberId: "", 
    amount: "", 
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [er, mr] = await Promise.all([
      fetch(`/api/individual-cost?month=${month}&year=${year}`),
      fetch("/api/members"),
    ]);
    setEntries(await er.json());
    setMembers(await mr.json());
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  // Per-member totals for sidebar
  const memberTotals = members
    .map((m) => ({
      name: m.user.name ?? m.user.email,
      initial: (m.user.name ?? m.user.email)[0]?.toUpperCase(),
      total: entries.filter((e) => e.memberId === m.id).reduce((s, e) => s + e.amount, 0),
    }))
    .filter((m) => m.total > 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/individual-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: form.memberId,
        month,
        year,
        amount: parseFloat(form.amount),
        description: form.description || null,
        date: form.date,
      }),
    });
    if (res.ok) {
      setForm({ 
        memberId: "", 
        amount: "", 
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
      fetchData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/individual-cost?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  const AddDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Cost
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Add Individual Cost</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ic-date">Date</Label>
            <Input 
              id="ic-date" 
              type="date" 
              value={form.date} 
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} 
              required 
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>Member</Label>
            <Select
              value={form.memberId}
              onValueChange={(v) => setForm((p) => ({ ...p, memberId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.user.name ?? m.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ic-amount">Amount (৳)</Label>
            <Input
              id="ic-amount"
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
            <Label htmlFor="ic-desc">Description (optional)</Label>
            <Input
              id="ic-desc"
              placeholder="e.g. Personal grocery, medicine"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={loading || !form.memberId}
          >
            {loading ? "Adding..." : "Add Cost"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const EntriesList = (
    <div className="divide-y">
      {entries.map((entry) => {
        const name = entry.member.user.name ?? entry.member.user.email;
        return (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950 text-sm font-bold text-rose-600 dark:text-rose-400">
                {name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(entry.amount)}</p>
                {entry.description && (
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                )}
                <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
              aria-label="Delete"
            >
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
            <h1 className="text-2xl font-bold">Individual Costs</h1>
            <p className="text-muted-foreground">Personal charges per member</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            {AddDialog}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: entries list */}
          <div className="col-span-2 rounded-xl border bg-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Entries</h2>
              <span className="text-sm text-muted-foreground">{entries.length} records</span>
            </div>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Receipt className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No individual costs yet</p>
                <p className="text-sm text-muted-foreground">Click Add Cost to record a personal charge</p>
              </div>
            ) : EntriesList}
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Receipt className="h-5 w-5" />
              </div>
              <p className="text-sm opacity-80">Total Individual</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="mt-1 text-xs opacity-70">{entries.length} entries this month</p>
            </div>

            {memberTotals.length > 0 && (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">By Member</p>
                {memberTotals.map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950 text-xs font-bold text-rose-600 dark:text-rose-400">
                        {m.initial}
                      </div>
                      <span className="text-sm">{m.name}</span>
                    </div>
                    <span className="font-semibold text-sm text-rose-600 dark:text-rose-400">{formatCurrency(m.total)}</span>
                  </div>
                ))}
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

        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Total Individual Costs</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="text-xs opacity-70">{entries.length} entries</p>
            </div>
          </div>
        </div>

        {memberTotals.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {memberTotals.map((m) => (
              <div key={m.name} className="rounded-2xl border bg-card p-3">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950 text-sm font-bold text-rose-600 dark:text-rose-400">
                  {m.initial}
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.name}</p>
                <p className="mt-0.5 text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(m.total)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3">
            <p className="font-semibold">Entries</p>
          </div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No individual costs yet</p>
              <p className="text-xs text-muted-foreground">Tap Add Cost to record a personal charge</p>
            </div>
          ) : EntriesList}
        </div>
      </div>
    </>
  );
}
