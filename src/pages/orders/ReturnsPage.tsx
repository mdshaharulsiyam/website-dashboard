import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { mockReturnRequests } from "@/data/mock";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReturnRequest } from "@/types";
import { toast } from "sonner";
import { Package, Eye } from "lucide-react";

const STATUS_VARIANTS: Record<ReturnRequest["status"], "warning" | "success" | "destructive" | "secondary"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
  "Partial Refund": "info" as "secondary",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(mockReturnRequests);
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [decision, setDecision] = useState<"Approved" | "Rejected" | "Partial Refund">("Approved");
  const [saving, setSaving] = useState(false);

  function openReview(r: ReturnRequest) {
    setSelected(r);
    setAdminNote(r.adminNote ?? "");
    setRefundAmount(String(r.refundAmount ?? ""));
    setDecision("Approved");
  }

  async function handleSubmit() {
    if (!selected) return;
    if (decision === "Partial Refund" && (!refundAmount || isNaN(Number(refundAmount)) || Number(refundAmount) <= 0)) {
      toast.error("Enter a valid refund amount for partial refund");
      return;
    }
    if (decision !== "Rejected" && !adminNote.trim()) {
      toast.error("Please add an admin note");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setReturns((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? { ...r, status: decision, adminNote, refundAmount: decision !== "Rejected" ? Number(refundAmount) : undefined, resolvedAt: new Date().toISOString() }
          : r
      )
    );
    setSaving(false);
    setSelected(null);
    toast.success(`Return ${selected.id} ${decision.toLowerCase()}`);
  }

  const columns: ColumnDef<ReturnRequest>[] = [
    { accessorKey: "id", header: "Return ID", cell: ({ row }) => <span className="font-mono text-xs font-semibold text-amber-700">{row.original.id}</span> },
    { accessorKey: "orderId", header: "Order", cell: ({ row }) => <span className="font-mono text-xs">{row.original.orderId}</span> },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "reason", header: "Reason", cell: ({ row }) => <Badge variant="secondary" className="text-xs">{row.original.reason}</Badge> },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={STATUS_VARIANTS[row.original.status] ?? "secondary"} className="text-xs">{row.original.status}</Badge>,
    },
    { accessorKey: "refundAmount", header: "Refund", cell: ({ row }) => row.original.refundAmount ? <span className="font-medium text-emerald-700">{formatCurrency(row.original.refundAmount)}</span> : <span className="text-slate-400">—</span> },
    { accessorKey: "createdAt", header: "Submitted", cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => openReview(row.original)}
          title="Review return"
          disabled={row.original.status !== "Pending"}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const pending = returns.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Returns & Refunds"
        description={`${returns.length} total · ${pending} pending review`}
      />

      {pending === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Package className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-emerald-700 font-medium">All return requests have been resolved</span>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={returns}
        emptyTitle="No return requests"
        emptyDescription="Return requests from customers will appear here."
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Return — {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
                <p><span className="text-slate-500">Order:</span> <span className="font-mono">{selected.orderId}</span></p>
                <p><span className="text-slate-500">Customer:</span> {selected.customerName}</p>
                <p><span className="text-slate-500">Reason:</span> {selected.reason}</p>
                <p><span className="text-slate-500">Description:</span> {selected.description}</p>
                <p><span className="text-slate-500">Photos:</span> {selected.photos.length} attached</p>
              </div>

              <div>
                <Label className="mb-1.5 block">Decision</Label>
                <Select value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approve (Full Refund)</SelectItem>
                    <SelectItem value="Partial Refund">Partial Refund</SelectItem>
                    <SelectItem value="Rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(decision === "Approved" || decision === "Partial Refund") && (
                <div>
                  <Label className="mb-1.5 block">Refund Amount (৳)</Label>
                  <Input type="number" min={1} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="e.g. 750" />
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">Admin Note</Label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Reason for decision…" rows={3} maxLength={500} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>Submit Decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
