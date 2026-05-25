"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, CreditCard } from "lucide-react";
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

interface Payment {
  id: string;
  memberId: string;
  amount: number;
  note: string | null;
  createdAt: string;
  member: { user: { name: string | null; email: string } };
}

export default function PaymentsPage() {
  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", amount: "", note: "" });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [pr, mr] = await Promise.all([
      fetch(`/api/payments?month=${month}&year=${year}`),
      fetch("/api/members"),
    ]);
    setPayments(await pr.json());
    setMembers(await mr.json());
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: form.memberId, month, year, amount: parseFloat(form.amount), note: form.note || null }),
    });
    if (res.ok) { setForm({ memberId: "", amount: "", note: "" }); setOpen(false); fetchData(); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this payment?")) return;
    await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
    fetchData();
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
              Record
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <Select value={form.memberId} onValueChange={(v) => setForm((p) => ({ ...p, memberId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.user.name ?? m.user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-amount">Amount (৳)</Label>
                <Input id="p-amount" type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-note">Note (optional)</Label>
                <Input id="p-note" placeholder="e.g. May deposit"
                  value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading || !form.memberId}>
                {loading ? "Saving..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero total */}
      <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm opacity-80">Total Collected</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs opacity-70">{payments.length} payments</p>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Payment History</p>
        </div>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No payments recorded yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-600">
                    {(payment.member.user.name ?? payment.member.user.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{payment.member.user.name ?? payment.member.user.email}</p>
                    {payment.note && <p className="text-xs text-muted-foreground">{payment.note}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">+{formatCurrency(payment.amount)}</span>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
