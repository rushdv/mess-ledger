"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, CreditCard } from "lucide-react";
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
    const [paymentsRes, membersRes] = await Promise.all([
      fetch(`/api/payments?month=${month}&year=${year}`),
      fetch("/api/members"),
    ]);
    setPayments(await paymentsRes.json());
    setMembers(await membersRes.json());
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: form.memberId,
        month,
        year,
        amount: parseFloat(form.amount),
        note: form.note || null,
      }),
    });
    if (res.ok) {
      setForm({ memberId: "", amount: "", note: "" });
      setOpen(false);
      fetchData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this payment?")) return;
    await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Record member deposits and payments</p>
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
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
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
                  <Label htmlFor="p-amount">Amount (৳)</Label>
                  <Input
                    id="p-amount"
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
                  <Label htmlFor="p-note">Note (optional)</Label>
                  <Input
                    id="p-note"
                    placeholder="e.g. May deposit"
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !form.memberId}>
                  {loading ? "Saving..." : "Record Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-full bg-green-50 p-3">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground">{payments.length} payments</p>
          </div>
        </CardContent>
      </Card>

      {/* Payments list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {payment.member.user.name ?? payment.member.user.email}
                    </p>
                    {payment.note && (
                      <p className="text-sm text-muted-foreground">{payment.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-green-600">
                      +{formatCurrency(payment.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(payment.id)}
                      aria-label="Delete payment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
