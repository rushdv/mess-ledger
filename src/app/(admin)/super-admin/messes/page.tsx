"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Mess {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  totalMembers: number;
  ownerName: string;
  ownerEmail: string;
  status: string;
}

export default function AdminMessesPage() {
  const { data: session } = useSession();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchMesses() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/messes?page=${page}&limit=10&search=${debouncedSearch}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMesses(data.messes);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (true) { // role guarded by server layout
      fetchMesses();
    }
  }, [session, page, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mess Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all tenant workspaces.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Messes</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or code..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset page on search
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mess Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading messes...
                    </TableCell>
                  </TableRow>
                ) : messes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No messes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  messes.map((mess) => (
                    <TableRow key={mess.id}>
                      <TableCell className="font-medium">{mess.name}</TableCell>
                      <TableCell>{mess.code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{mess.ownerName}</span>
                          <span className="text-xs text-muted-foreground">{mess.ownerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{mess.totalMembers}</TableCell>
                      <TableCell>{format(new Date(mess.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={mess.status === "Active" ? "default" : "secondary"} className={mess.status === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {mess.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {Math.max(1, totalPages)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
