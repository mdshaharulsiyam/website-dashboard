import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { mockSupportTickets } from "@/data/mock";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, BEE_LEVEL_COLORS } from "@/lib/utils";
import type { SupportTicket, SupportTicketStatus, SupportPriority } from "@/types";

const PRIORITY_VARIANTS: Record<SupportPriority, "secondary" | "warning" | "default"> = {
  Normal: "secondary",
  Urgent: "warning",
  VIP: "default",
};

export default function SupportPage() {
  const [tickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<SupportPriority | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      if (q && !t.customerName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const columns: ColumnDef<SupportTicket>[] = [
    {
      accessorKey: "id",
      header: "Ticket",
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-amber-700">{row.original.id}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.customerName}</p>
          <Badge className={`text-xs ${BEE_LEVEL_COLORS[row.original.beeLevel]}`}>{row.original.beeLevel}</Badge>
        </div>
      ),
    },
    { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="text-sm text-slate-700 max-w-[200px] block truncate">{row.original.subject}</span> },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <Badge variant={PRIORITY_VARIANTS[row.original.priority] ?? "secondary"} className="text-xs">{row.original.priority}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Resolved" ? "success" : row.original.status === "In Progress" ? "warning" : "secondary"} className="text-xs">
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "assignedTo", header: "Assigned To", cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.assignedTo ?? "Unassigned"}</span> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-xs text-slate-400">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link to={`/support/${row.original.id}`}>
          <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
        </Link>
      ),
    },
  ];

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const urgentCount = tickets.filter((t) => t.priority === "Urgent" || t.priority === "VIP").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Support"
        description={`${tickets.length} tickets · ${openCount} open · ${urgentCount} urgent/VIP`}
      />

      <div className="grid grid-cols-3 gap-4">
        {(["Open", "In Progress", "Resolved"] as SupportTicketStatus[]).map((s) => (
          <Card key={s} className="cursor-pointer hover:border-amber-400" onClick={() => setStatusFilter(s)}>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">{s}</p>
              <p className="text-2xl font-bold">{tickets.filter((t) => t.status === s).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search tickets…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SupportTicketStatus | "all")}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(["Open", "In Progress", "Resolved"] as SupportTicketStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as SupportPriority | "all")}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No support tickets" emptyDescription="Customer messages will appear here." pageSize={15} />
    </div>
  );
}
