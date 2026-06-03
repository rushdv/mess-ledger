"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, Plus, LogIn, LogOut } from "lucide-react";
import { WelcomeModal } from "@/components/welcome-modal";

interface Mess {
  id: string;
  name: string;
  code: string;
  description: string | null;
  role: string;
  joinedAt: Date;
}

export default function SelectMessClient() {
  const router = useRouter();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessName, setWelcomeMessName] = useState("");
  const [isNewMess, setIsNewMess] = useState(false);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchMesses();
  }, []);

  async function fetchMesses() {
    try {
      const res = await fetch("/api/mess");
      if (res.ok) {
        const data = await res.json();
        setMesses(data);
      }
    } catch (err) {
      console.error("Failed to fetch messes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function selectMess(messId: string, messName?: string, isNew: boolean = false) {
    try {
      const res = await fetch("/api/mess/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messId }),
      });

      if (res.ok) {
        if (messName) {
          setWelcomeMessName(messName);
          setIsNewMess(isNew);
          setShowWelcome(true);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        setError("Failed to select mess");
      }
    } catch {
      setError("Failed to select mess");
    }
  }

  async function handleCreateMess(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreateLoading(true);

    try {
      const res = await fetch("/api/mess/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          code: createCode.toUpperCase(),
          description: createDesc || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await selectMess(data.id, createName, true);
      } else {
        setError(data.error || data.details || "Failed to create mess");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create mess");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinMess(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setJoinLoading(true);

    try {
      const res = await fetch("/api/mess/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      });

      if (res.ok) {
        const mess = await res.json();
        await selectMess(mess.id, mess.name, false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join mess");
      }
    } catch {
      setError("Failed to join mess");
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <WelcomeModal isNewMess={isNewMess} messName={welcomeMessName} />
      )}

      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 to-background">
        {/* Logout Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Select Your Mess</h1>
              <p className="text-sm text-muted-foreground">Choose a mess or create a new one</p>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            {/* Existing Messes */}
            {messes.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Your Messes</h2>
                {messes.map((mess) => (
                  <Card
                    key={mess.id}
                    className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => selectMess(mess.id)}
                  >
                    <div>
                      <h3 className="font-semibold">{mess.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Code: {mess.code} • {mess.role}
                      </p>
                      {mess.description && (
                        <p className="text-sm text-muted-foreground mt-1">{mess.description}</p>
                      )}
                    </div>
                    <Button size="sm">Select</Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setShowCreateForm(true);
                  setShowJoinForm(false);
                  setError("");
                }}
              >
                <Plus className="h-6 w-6" />
                <span>Create New Mess</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setShowJoinForm(true);
                  setShowCreateForm(false);
                  setError("");
                }}
              >
                <LogIn className="h-6 w-6" />
                <span>Join Existing Mess</span>
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Create New Mess</h3>
                <form onSubmit={handleCreateMess} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Mess Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Dhaka Mess"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Unique Code * (for inviting members)</Label>
                    <Input
                      id="code"
                      placeholder="e.g., DHAKA2024"
                      value={createCode}
                      onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <Input
                      id="desc"
                      placeholder="e.g., Student hostel mess"
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createLoading} className="flex-1">
                      {createLoading ? "Creating..." : "Create Mess"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Join Form */}
            {showJoinForm && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Join Existing Mess</h3>
                <form onSubmit={handleJoinMess} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">Mess Code *</Label>
                    <Input
                      id="joinCode"
                      placeholder="e.g., DHAKA2024"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask your mess admin for the invite code
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={joinLoading} className="flex-1">
                      {joinLoading ? "Joining..." : "Join Mess"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowJoinForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
