"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserX, UserCheck, Phone, Mail, Shield } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string;
  phone: string | null;
  isActive: boolean;
  joinedAt: string;
  user: { id: string; name: string | null; email: string; role: string };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/members");
    setMembers(await res.json());
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", email: "", phone: "", password: "" });
      setOpen(false);
      fetchMembers();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to add member");
    }
    setLoading(false);
  }

  async function toggleActive(member: Member) {
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    fetchMembers();
  }

  const active = members.filter((m) => m.isActive);
  const inactive = members.filter((m) => !m.isActive);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl">
              <Plus className="mr-1 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
            <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="m-name">Full Name</Label>
                <Input id="m-name" placeholder="Rahim Uddin"
                  value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-email">Email</Label>
                <Input id="m-email" type="email" placeholder="rahim@example.com"
                  value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-phone">Phone (optional)</Label>
                <Input id="m-phone" placeholder="01700000000"
                  value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-pass">Password</Label>
                <Input id="m-pass" type="password" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Adding..." : "Add Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active members */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Active Members</p>
        </div>
        {active.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No active members</p>
        ) : (
          <div className="divide-y">
            {active.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                    {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
                    {member.user.role === "ADMIN" && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                        <Shield className="h-2.5 w-2.5 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.user.name ?? member.user.email}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[140px]">{member.user.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(member)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                  aria-label="Deactivate"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive members */}
      {inactive.length > 0 && (
        <div className="rounded-2xl border bg-card opacity-70">
          <div className="border-b px-4 py-3">
            <p className="font-semibold text-muted-foreground">Inactive Members</p>
          </div>
          <div className="divide-y">
            {inactive.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-bold text-muted-foreground">
                    {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">{member.user.name ?? member.user.email}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(member)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-green-600 transition-colors hover:bg-green-50 active:bg-green-100"
                  aria-label="Reactivate"
                >
                  <UserCheck className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
