"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserX, UserCheck, Phone, Mail, Shield, Users, Crown, Utensils, CalendarRange } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string; 
  phone: string | null; 
  isActive: boolean; 
  joinedAt: string;
  messRole?: string; // ADMIN | MODERATOR | MEMBER
  defaultBreakfast: number;
  defaultLunch: number;
  defaultDinner: number;
  user: { id: string; name: string | null; email: string; role: string };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { messContext } = useMessContext();
  const { data: session } = useSession();
  
  // Use mess-specific role
  const isMessAdmin = messContext?.isMessAdmin ?? false;

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(data);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ name: "", email: "", phone: "", password: "" }); setOpen(false); fetchMembers(); }
    else { const data = await res.json(); setError(data.error ?? "Failed to add member"); }
    setLoading(false);
  }

  async function toggleActive(member: Member) {
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    fetchMembers();
  }

  async function changeRole(memberId: string, newRole: string) {
    const res = await fetch(`/api/members/${memberId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      fetchMembers();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to change role");
    }
  }

  const active = members.filter((m) => m.isActive);
  const inactive = members.filter((m) => !m.isActive);

  const AddDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl"><Plus className="mr-1.5 h-4 w-4" />Add Member</Button>
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl sm:mx-auto">
        <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="m-name">Full Name</Label>
            <Input id="m-name" placeholder="Rahim Uddin" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-email">Email</Label>
            <Input id="m-email" type="email" placeholder="rahim@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-phone">Phone (optional)</Label>
            <Input id="m-phone" placeholder="01700000000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-pass">Password</Label>
            <Input id="m-pass" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>{loading ? "Adding..." : "Add Member"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const DefaultMealsDialog = ({ member }: { member: Member }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [breakfast, setBreakfast] = useState(member.defaultBreakfast.toString());
    const [lunch, setLunch] = useState(member.defaultLunch.toString());
    const [dinner, setDinner] = useState(member.defaultDinner.toString());

    async function handleSave(e: React.FormEvent) {
      e.preventDefault();
      setSaving(true);
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultBreakfast: parseInt(breakfast) || 0,
          defaultLunch: parseInt(lunch) || 0,
          defaultDinner: parseInt(dinner) || 0,
        }),
      });
      setSaving(false);
      setIsOpen(false);
      fetchMembers();
    }

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
            <Utensils className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Default Meals</DialogTitle>
            <p className="text-sm text-muted-foreground">Set default daily meals for {member.user.name}</p>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Breakfast</Label>
                <Input type="number" min="0" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} className="text-center" />
              </div>
              <div className="space-y-2">
                <Label>Lunch</Label>
                <Input type="number" min="0" value={lunch} onChange={(e) => setLunch(e.target.value)} className="text-center" />
              </div>
              <div className="space-y-2">
                <Label>Dinner</Label>
                <Input type="number" min="0" value={dinner} onChange={(e) => setDinner(e.target.value)} className="text-center" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Defaults"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const GenerateMealsDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [msg, setMsg] = useState<{text: string, type: 'error'|'success'} | null>(null);
    
    // Default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);

    async function handleGenerate(e: React.FormEvent) {
      e.preventDefault();
      setGenerating(true);
      setMsg(null);
      
      const res = await fetch("/api/meals/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startDate: new Date(startDate).toISOString(), 
          endDate: new Date(endDate).toISOString() 
        }),
      });
      
      const data = await res.json();
      setGenerating(false);
      
      if (res.ok) {
        setMsg({ text: data.message, type: 'success' });
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setMsg({ text: data.error, type: 'error' });
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
            <CalendarRange className="mr-2 h-4 w-4" />
            Auto-Meals
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate Default Meals</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Automatically assigns the default meal count for all active members. 
              Existing meal entries within this range will be skipped.
            </p>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            
            {msg && (
              <div className={`p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                {msg.text}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={generating}>
              {generating ? "Generating..." : "Generate Meals"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const MemberRow = ({ member }: { member: Member }) => {
    const isAdmin = member.messRole === "ADMIN";
    const isModerator = member.messRole === "MODERATOR";
    const canChangeRole = isMessAdmin && !isAdmin; 
    const canEditDefaults = isMessAdmin || member.user.id === session?.user?.id;
    
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 md:px-5 md:py-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
            {isAdmin && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <Crown className="h-2.5 w-2.5 text-white" />
              </span>
            )}
            {isModerator && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                <Shield className="h-2.5 w-2.5 text-white" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{member.user.name ?? member.user.email}</p>
              {isAdmin && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  Admin
                </span>
              )}
              {isModerator && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Moderator
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" /><span className="truncate max-w-[150px]">{member.user.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /><span>{member.phone}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-accent/50 text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">
                DEF: {member.defaultBreakfast}-{member.defaultLunch}-{member.defaultDinner}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canEditDefaults && <DefaultMealsDialog member={member} />}
          
          {canChangeRole && (
            <select
              value={member.messRole || "MEMBER"}
              onChange={(e) => changeRole(member.id, e.target.value)}
              className="rounded-lg border bg-background px-2 py-1 text-xs font-medium"
            >
              <option value="MEMBER">Member</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          )}
          
          {isMessAdmin && (
            <button
              onClick={() => toggleActive(member)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                member.isActive
                  ? "text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                  : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
              }`}
              aria-label={member.isActive ? "Deactivate" : "Reactivate"}
            >
              {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground">{active.length} active · {inactive.length} inactive</p>
          </div>
          <div className="flex gap-3">
            {isMessAdmin && <GenerateMealsDialog />}
            {isMessAdmin && AddDialog}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Member table */}
          <div className="col-span-2 rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Active Members</h2>
            </div>
            {active.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No active members</p>
              </div>
            ) : (
              <div className="divide-y">
                {active.map((m) => <MemberRow key={m.id} member={m} />)}
              </div>
            )}
            {inactive.length > 0 && (
              <>
                <div className="border-t border-b bg-muted/30 px-5 py-3">
                  <p className="text-sm font-medium text-muted-foreground">Inactive Members</p>
                </div>
                <div className="divide-y opacity-60">
                  {inactive.map((m) => <MemberRow key={m.id} member={m} />)}
                </div>
              </>
            )}
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-5 text-primary-foreground">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm opacity-80">Total Members</p>
              <p className="mt-1 text-4xl font-bold">{members.length}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/15 p-2 text-center">
                  <p className="text-lg font-bold">{active.length}</p>
                  <p className="text-xs opacity-70">Active</p>
                </div>
                <div className="rounded-lg bg-white/15 p-2 text-center">
                  <p className="text-lg font-bold">{inactive.length}</p>
                  <p className="text-xs opacity-70">Inactive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="space-y-5 md:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Members</p>
          <div className="flex gap-2">
            {isMessAdmin && <GenerateMealsDialog />}
            {isMessAdmin && AddDialog}
          </div>
        </div>
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3"><p className="font-semibold">Active</p></div>
          {active.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No active members</p>
          ) : (
            <div className="divide-y">{active.map((m) => <MemberRow key={m.id} member={m} />)}</div>
          )}
        </div>
        {inactive.length > 0 && (
          <div className="rounded-2xl border bg-card opacity-70">
            <div className="border-b px-4 py-3"><p className="font-semibold text-muted-foreground">Inactive</p></div>
            <div className="divide-y">{inactive.map((m) => <MemberRow key={m.id} member={m} />)}</div>
          </div>
        )}
      </div>
    </>
  );
}
