"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, UserCog } from "lucide-react";
import { useSession } from "next-auth/react";

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

interface UserData {
  id: string;
  name: string;
  email: string;
  totalMessesCreated: number;
  registrationDate: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
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
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === "SUPER_ADMIN") {
      fetchUsers();
    }
  }, [session, page, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Messes Created</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role.toLowerCase().replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.totalMessesCreated}</TableCell>
                      <TableCell>{format(new Date(user.registrationDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                        </Button>
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
