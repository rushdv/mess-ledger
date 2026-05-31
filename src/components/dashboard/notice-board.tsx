"use client";

import { useState, useEffect } from "react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Notice {
  id: string;
  content: string;
  createdAt: string;
}

export function NoticeBoard() {
  const { messContext } = useMessContext();
  const isAdmin = messContext?.isMessAdmin ?? false;

  const [notices, setNotices] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [messContext?.messId]);

  async function fetchNotices() {
    const res = await fetch("/api/notices");
    if (res.ok) setNotices(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, expiresAt: expiresAt || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setContent("");
      setExpiresAt("");
      fetchNotices();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notice?")) return;
    const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
    if (res.ok) fetchNotices();
  }

  if (notices.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 w-full">
          <div className="mt-1 shrink-0 rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="w-full">
            <h3 className="font-semibold text-orange-900 dark:text-orange-200">Mess Notice Board</h3>
            {notices.length > 0 ? (
              <div className="mt-2 space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="group relative pr-8">
                    <p className="text-sm text-orange-800 dark:text-orange-300/90 whitespace-pre-wrap">{n.content}</p>
                    <p className="text-xs text-orange-600/70 mt-1">{formatDate(n.createdAt)}</p>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded-md transition-all"
                        aria-label="Delete notice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-orange-700/70 dark:text-orange-300/60">No active notices.</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0 bg-white/50 hover:bg-white/80 border-orange-200 text-orange-700">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[400px]">
              <DialogHeader><DialogTitle>Post New Notice</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <textarea
                    required
                    className="w-full min-h-[100px] rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Write your announcement here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires At (Optional)</Label>
                  <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Notice will auto-hide after this time.</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Posting..." : "Post Notice"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
