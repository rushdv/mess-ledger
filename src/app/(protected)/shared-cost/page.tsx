"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, Share2, Users } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  user: { name: string | null; email: string };
}

interface SharedCostEntry {
  id: string;
  amount: number;
  description: string | null;
  createdAt: string;
  members: {
    member: { id: string; user: { name: string | null; email: string } };
  }[];
}

export default function SharedCostPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [entries, setEntries] = useState<SharedCostEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    amount: "", 
    description: "", 
    memberIds: [] as string[],
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [er, mr] = await Promise.all([
      fetch(`/api/shared-cost?month=${month}&year=${year}`),
      fetch("/api/members"),
    ]);
    setEntries(await er.json());
    setMembers(await mr.json());
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  function toggleMember(id: string) {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter((m) => m !== id)
        : [...prev.memberIds, id],
    }));
  }

  function selectAll() {
    setForm((prev) => ({ ...prev, memberIds: members.map((m) => m.id) }));
  }

  function clearAll() {
    setForm((prev) => ({ ...prev, memberIds: [] }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.memberIds.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/shared-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        amount: parseFloat(form.amount),
        description: form.description || null,
        memberIds: form.memberIds,
        date: form.date,
      }),
    });
    if (res.ok) {
      setForm({ 
        amount: "", 
        description: "", 
        memberIds: [],
        date: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
      fetchData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/shared-cost?id=${id}`, { method: "DELETE" });
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
          <DialogTitle>Add Shared Cost</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sc-date">Date</Label>
            <Input 
              id="sc-date" 
              type="date" 
              value={form.date} 
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} 
              required 
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc-amount">Amount (৳)</Label>
            <Input
              id="sc-amount"
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
            <Label htmlFor="sc-desc">Description (optional)</Label>
            <Input
              id="sc-desc"
              placeholder="e.g. Weekend trip, shared snacks"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Split Among</Label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">All</button>
                <span className="text-xs text-muted-foreground">·</span>
                <button type="button" onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border p-2">
              {members.map((m) => {
                const name = m.user.name ?? m.user.email;
                const selected = form.memberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? "bg-white/20" : "bg-primary/10 text-primary"
                    }`}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="truncate font-medium">{name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
            {form.memberIds.length > 0 && form.amount && (
              <p className="text-xs text-muted-foreground">
                Each pays {formatCurrency(parseFloat(form.amount) / form.memberIds.length)} ({form.memberIds.length} members)
              </p>
            )}
            {form.memberIds.length === 0 && (
              <p className="text-xs text-destructive">Select at least one member</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={loading || form.memberIds.length === 0 || !form.amount}
          >
            {loading ? "Adding..." : "Add Shared Cost"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const EntriesList = (
    <div className="divide-y">
      {entries.map((entry) => {
        const perHead = entry.amount / entry.members.length;
        return (
          <div key={entry.id} className="px-4 py-3 md:px-5 md:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                  <Share2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(entry.amount)}</p>
                    <span className="text-xs text-muted-foreground">÷ {entry.members.length} = {formatCurrency(perHead)} each</span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.members.map(({ member }) => {
                      const name = member.user.name ?? member.user.email;
                      return (
                        <span key={member.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          {name.split(" ")[0]}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
            <h1 className="text-2xl font-bold">Shared Cost</h1>
            <p className="text-muted-foreground">Split expenses among selected members</p>
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
                <Share2 className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No shared costs yet</p>
                <p className="text-sm text-muted-foreground">Click Add Cost to split an expense</p>
              </div>
            ) : EntriesList}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Share2 className="h-5 w-5" />
              </div>
              <p className="text-sm opacity-80">Total Shared</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="mt-1 text-xs opacity-70">{entries.length} entries this month</p>
            </div>

            {entries.length > 0 && (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">How it works</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Each shared cost is split equally among the selected members. The per-member share is added to their total cost for the month.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{entries.reduce((s, e) => s + e.members.length, 0)} total member-entries</span>
                </div>
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

        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Total Shared Costs</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
              <p className="text-xs opacity-70">{entries.length} entries</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3">
            <p className="font-semibold">Entries</p>
          </div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Share2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No shared costs yet</p>
              <p className="text-xs text-muted-foreground">Tap Add Cost to split an expense</p>
            </div>
          ) : EntriesList}
        </div>
      </div>
    </>
  );
}
