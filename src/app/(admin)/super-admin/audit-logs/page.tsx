"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { useSession } from "@/lib/auth-client";

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

interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminName: string;
  adminEmail: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=20`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (true) { // role guarded by server layout
      fetchLogs();
    }
  }, [session, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System security and administrative action logs.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle>System Logs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs bg-muted/50">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.adminName}</span>
                          <span className="text-xs text-muted-foreground">{log.adminEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
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
