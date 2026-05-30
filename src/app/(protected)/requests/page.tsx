"use client";

import { useState, useEffect, useCallback } from "react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Plus, Receipt, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RequestItem {
  id: string;
  amount: number;
  trxId?: string;
  description?: string;
  note?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  date: string;
  createdAt: string;
  member: {
    user: { name: string | null; email: string };
  };
}

export default function RequestsPage() {
  const { messContext } = useMessContext();
  const isAdmin = messContext?.isMessAdmin ?? false;

  const [paymentReqs, setPaymentReqs] = useState<RequestItem[]>([]);
  const [expenseReqs, setExpenseReqs] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [payOpen, setPayOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", trxId: "", note: "", date: new Date().toISOString().split("T")[0] });
  const [expForm, setExpForm] = useState({ amount: "", description: "", date: new Date().toISOString().split("T")[0] });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const [pRes, eRes] = await Promise.all([
      fetch("/api/requests/payment"),
      fetch("/api/requests/expense")
    ]);
    if (pRes.ok) setPaymentReqs(await pRes.json());
    if (eRes.ok) setExpenseReqs(await eRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/requests/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(payForm.amount),
        trxId: payForm.trxId,
        note: payForm.note,
        date: new Date(payForm.date).toISOString()
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setPayOpen(false);
      setPayForm({ amount: "", trxId: "", note: "", date: new Date().toISOString().split("T")[0] });
      fetchRequests();
    } else {
      alert("Failed to submit request.");
    }
  }

  async function handleExpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/requests/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(expForm.amount),
        description: expForm.description,
        date: new Date(expForm.date).toISOString()
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setExpOpen(false);
      setExpForm({ amount: "", description: "", date: new Date().toISOString().split("T")[0] });
      fetchRequests();
    } else {
      alert("Failed to submit request.");
    }
  }

  async function handleStatusUpdate(type: "payment" | "expense", id: string, status: "APPROVED" | "REJECTED") {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    const res = await fetch(`/api/requests/${type}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchRequests();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update status");
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "APPROVED": return <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> Approved</span>;
      case "REJECTED": return <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  const RequestList = ({ items, type }: { items: RequestItem[], type: "payment" | "expense" }) => {
    if (items.length === 0) {
      return <div className="text-center py-12 text-muted-foreground bg-card border rounded-2xl">No requests found.</div>;
    }

    return (
      <div className="space-y-4">
        {items.map((req) => (
          <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border rounded-2xl gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base">{req.member.user.name || req.member.user.email}</span>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm font-medium text-primary">৳{Number(req.amount).toFixed(2)}</p>
              
              <div className="text-sm text-muted-foreground mt-1">
                {type === "payment" ? (
                  <>
                    {req.trxId && <p>TrxID: {req.trxId}</p>}
                    {req.note && <p>Note: {req.note}</p>}
                  </>
                ) : (
                  <p>Desc: {req.description}</p>
                )}
                <p className="text-xs mt-1 opacity-70">Date: {formatDate(req.date)}</p>
              </div>
            </div>

            {isAdmin && req.status === "PENDING" && (
              <div className="flex gap-2 self-start sm:self-center">
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(type, req.id, "APPROVED")}>Approve</Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(type, req.id, "REJECTED")}>Reject</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Requests</h1>
        <p className="text-muted-foreground">Manage payment and expense requests.</p>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="payments">Payment Requests</TabsTrigger>
          <TabsTrigger value="expenses">Bazar Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus className="mr-1.5 h-4 w-4" />New Payment</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Submit Payment Request</DialogTitle></DialogHeader>
                <form onSubmit={handlePaySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount (৳) *</Label>
                    <Input type="number" min="1" step="0.01" value={payForm.amount} onChange={(e) => setPayForm(p => ({...p, amount: e.target.value}))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Transaction ID (TrxID)</Label>
                    <Input placeholder="e.g. 9BCA3D..." value={payForm.trxId} onChange={(e) => setPayForm(p => ({...p, trxId: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Note (Optional)</Label>
                    <Input placeholder="e.g. Sent via bKash" value={payForm.note} onChange={(e) => setPayForm(p => ({...p, note: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={payForm.date} onChange={(e) => setPayForm(p => ({...p, date: e.target.value}))} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting..." : "Submit Request"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <div className="text-center py-10">Loading...</div> : <RequestList items={paymentReqs} type="payment" />}
        </TabsContent>
        
        <TabsContent value="expenses" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Dialog open={expOpen} onOpenChange={setExpOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus className="mr-1.5 h-4 w-4" />New Bazar Expense</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Submit Bazar Expense</DialogTitle></DialogHeader>
                <form onSubmit={handleExpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount (৳) *</Label>
                    <Input type="number" min="1" step="0.01" value={expForm.amount} onChange={(e) => setExpForm(p => ({...p, amount: e.target.value}))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description / Items *</Label>
                    <Input placeholder="e.g. Rice, Onion, Fish" value={expForm.description} onChange={(e) => setExpForm(p => ({...p, description: e.target.value}))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={expForm.date} onChange={(e) => setExpForm(p => ({...p, date: e.target.value}))} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting..." : "Submit Request"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <div className="text-center py-10">Loading...</div> : <RequestList items={expenseReqs} type="expense" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
