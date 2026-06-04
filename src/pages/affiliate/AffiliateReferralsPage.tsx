import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useGetAdminReferralOrdersQuery, useUpdateReferralOrderStatusMutation } from "@/store/affiliateApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AffiliateReferralsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Approved" | "Refunded">("all");
  const [actionTarget, setActionTarget] = useState<{ id: string; status: "Approved" | "Refunded" } | null>(null);

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useGetAdminReferralOrdersQuery({ page, limit: 20 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReferralOrderStatusMutation();

  const referrals = data?.data || [];
  const pagination = data?.pagination;

  const filtered = referrals.filter((ref: any) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || 
      ref.affiliate_id?.name?.toLowerCase().includes(q) ||
      ref.customer_id?.name?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && ref.payment_status !== statusFilter) return false;
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
      accessorKey: "affiliate_id",
      header: "Affiliate",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{row.original.affiliate_id?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400 truncate">{row.original.affiliate_id?.email || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: "customer_id",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{row.original.customer_id?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400 truncate">{row.original.customer_id?.email || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: "order_id",
      header: "Order Total",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(row.original.order_id?.final_amount || 0)}
        </span>
      ),
    },
    {
      accessorKey: "commission_amount",
      header: "Commission",
      cell: ({ row }) => (
        <span className="font-semibold text-[#F59E0B]">
          {formatCurrency(row.original.commission_amount)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "payment_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.payment_status === "Approved" ? "success" : row.original.payment_status === "Refunded" ? "destructive" : "default"} className="text-xs">
          {row.original.payment_status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const ref = row.original;
        if (ref.payment_status !== "Pending") return null;

        return (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Approve Commission"
              onClick={() => setActionTarget({ id: ref._id, status: "Approved" })}
            >
              <CheckCircle className="h-4 w-4 text-emerald-500 hover:text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Refund / Cancel"
              onClick={() => setActionTarget({ id: ref._id, status: "Refunded" })}
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
        title="Affiliate Referrals"
        description="Manage and approve affiliate referral commissions."
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search affiliate or customer name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-72"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }}>
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
          <p className="text-sm font-medium text-slate-700">Unable to load referral orders.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>Try Again</Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle={search ? "No referrals match your search" : "No referrals yet"}
          pageSize={20}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!actionTarget}
        onOpenChange={(open) => !open && setActionTarget(null)}
        title={actionTarget?.status === "Approved" ? "Approve Commission?" : "Refund Commission?"}
        description={actionTarget?.status === "Approved" ? "This will add the commission to the affiliate's balance." : "This will mark the referral as refunded and no commission will be paid."}
        confirmLabel={actionTarget?.status === "Approved" ? "Approve" : "Refund"}
        variant={actionTarget?.status === "Approved" ? "default" : "destructive"}
        onConfirm={handleUpdateStatus}
        loading={isUpdating}
      />
    </div>
  );
}
