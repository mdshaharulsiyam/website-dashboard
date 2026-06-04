import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2, PlayCircle, CheckCircle, XCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useGetAdminWithdrawalsQuery, useUpdateWithdrawalStatusMutation } from "@/store/affiliateApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AffiliateWithdrawalsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Processing" | "Completed" | "Rejected">("all");
  const [actionTarget, setActionTarget] = useState<{ id: string; status: "Processing" | "Completed" | "Rejected" } | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminWithdrawalsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateWithdrawalStatusMutation();

  const withdrawals = data?.data || [];

  const filtered = withdrawals.filter((w: any) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || 
      w.user_id?.name?.toLowerCase().includes(q) ||
      w.bkash_number?.includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = async () => {
    if (!actionTarget) return;
    try {
      const res = await updateStatus({ id: actionTarget.id, status: actionTarget.status }).unwrap();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.data?.message || error.message || "Failed to update status");
    } finally {
      setActionTarget(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "user_id",
      header: "Affiliate",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{row.original.user_id?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400 truncate">{row.original.user_id?.email || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: "bkash_number",
      header: "bKash Number",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{row.original.bkash_number}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-[#F59E0B]">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Requested On",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === "Completed" ? "success" : s === "Rejected" ? "destructive" : s === "Processing" ? "default" : "secondary"} className="text-xs">
            {s}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const w = row.original;
        if (w.status === "Completed" || w.status === "Rejected") return null;

        return (
          <div className="flex gap-1 justify-end">
            {w.status === "Pending" && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Mark Processing"
                onClick={() => setActionTarget({ id: w._id, status: "Processing" })}
              >
                <PlayCircle className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              title="Mark Completed"
              onClick={() => setActionTarget({ id: w._id, status: "Completed" })}
            >
              <CheckCircle className="h-4 w-4 text-emerald-500 hover:text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Reject"
              onClick={() => setActionTarget({ id: w._id, status: "Rejected" })}
            >
              <XCircle className="h-4 w-4 text-red-500 hover:text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Withdrawal Requests"
        description="Process bKash withdrawal requests from affiliates."
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or bKash..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : isError ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
          <p className="text-sm font-medium text-slate-700">Unable to load withdrawals.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>Try Again</Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle={search ? "No requests match your search" : "No withdrawal requests yet"}
          pageSize={20}
        />
      )}

      <ConfirmDialog
        open={!!actionTarget}
        onOpenChange={(open) => !open && setActionTarget(null)}
        title={actionTarget?.status === "Completed" ? "Complete Withdrawal?" : actionTarget?.status === "Rejected" ? "Reject Withdrawal?" : "Process Withdrawal?"}
        description={
          actionTarget?.status === "Completed" ? "This will mark the request as paid and finalize the withdrawal." : 
          actionTarget?.status === "Rejected" ? "This will reject the request and return the locked funds to the affiliate's balance." :
          "This will mark the request as currently being processed."
        }
        confirmLabel={actionTarget?.status || "Confirm"}
        variant={actionTarget?.status === "Rejected" ? "destructive" : "default"}
        onConfirm={handleUpdateStatus}
        loading={isUpdating}
      />
    </div>
  );
}
