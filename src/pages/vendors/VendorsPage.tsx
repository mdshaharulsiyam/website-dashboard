import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, XCircle, Download } from "lucide-react";
import { mockVendors } from "@/data/mock";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, formatPercent, downloadCSV } from "@/lib/utils";
import type { Vendor, VendorStatus } from "@/types";
import { toast } from "sonner";

const STATUS_VARIANTS: Record<VendorStatus, "warning" | "info" | "success" | "destructive"> = {
  Pending: "warning",
  "Under Review": "info" as "warning",
  Approved: "success",
  Rejected: "destructive",
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.email.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vendors, search, statusFilter]);

  async function handleApprove(vendor: Vendor) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, status: "Approved", approvedAt: new Date().toISOString() } : v));
    setSaving(false);
    setSelected(null);
    toast.success(`${vendor.name} approved — onboarding email sent`);
  }

  async function handleReject() {
    if (!selected) return;
    if (!rejectReason.trim()) { toast.error("Rejection reason required"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setVendors((prev) => prev.map((v) => v.id === selected.id ? { ...v, status: "Rejected" } : v));
    setSaving(false);
    setSelected(null);
    setRejectReason("");
    setActionType(null);
    toast.success(`${selected.name} rejected`);
  }

  const columns: ColumnDef<Vendor>[] = [
    { accessorKey: "name", header: "Vendor", cell: ({ row }) => <div><p className="text-sm font-medium">{row.original.name}</p><p className="text-xs text-slate-400">{row.original.email}</p></div> },
    { accessorKey: "commissionRate", header: "Commission", cell: ({ row }) => <span className="font-medium">{formatPercent(row.original.commissionRate, 0)}</span> },
    { accessorKey: "totalSales", header: "Total Sales", cell: ({ row }) => <span>{formatCurrency(row.original.totalSales)}</span>, sortingFn: "basic" },
    { accessorKey: "pendingCommission", header: "Pending Commission", cell: ({ row }) => <span className="text-amber-700 font-medium">{formatCurrency(row.original.pendingCommission)}</span> },
    { id: "designs", header: "Designs", cell: ({ row }) => <span className="text-xs">{row.original.designsApproved} approved · {row.original.designsPending} pending</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={(STATUS_VARIANTS[row.original.status] as "warning" | "success" | "destructive") ?? "secondary"} className="text-xs">{row.original.status}</Badge> },
    { accessorKey: "appliedAt", header: "Applied", cell: ({ row }) => <span className="text-xs text-slate-400">{formatDate(row.original.appliedAt)}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" title="View" onClick={() => setSelected(v)}>
              <Eye className="h-4 w-4" />
            </Button>
            {(v.status === "Pending" || v.status === "Under Review") && (
              <>
                <Button variant="ghost" size="icon-sm" title="Approve" className="text-emerald-600" onClick={() => handleApprove(v)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" title="Reject" className="text-red-500" onClick={() => { setSelected(v); setActionType("reject"); setRejectReason(""); }}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const pendingCount = vendors.filter((v) => v.status === "Pending" || v.status === "Under Review").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vendor / Design Partners"
        description={`${vendors.length} total · ${pendingCount} pending review`}
        actions={
          <Button variant="outline" size="sm" onClick={() => {
            const rows = [["Name", "Email", "Status", "Commission", "Total Sales", "Applied"], ...vendors.map((v) => [v.name, v.email, v.status, `${v.commissionRate}%`, String(v.totalSales), formatDate(v.appliedAt)])];
            downloadCSV("vendors.csv", rows);
            toast.success("Exported");
          }}>
            <Download className="h-4 w-4" />Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["Pending", "Under Review", "Approved", "Rejected"] as VendorStatus[]).map((s) => (
          <Card key={s} className="cursor-pointer hover:border-amber-400" onClick={() => setStatusFilter(s)}>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">{s}</p>
              <p className="text-2xl font-bold">{vendors.filter((v) => v.status === s).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VendorStatus | "all")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(["Pending", "Under Review", "Approved", "Rejected"] as VendorStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No vendors" emptyDescription="Vendor applications will appear here." pageSize={15} />

      {selected && actionType !== "reject" && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{selected.name}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Email", selected.email], ["Phone", selected.phone],
                  ["Status", selected.status], ["Commission", `${selected.commissionRate}%`],
                  ["Total Sales", formatCurrency(selected.totalSales)], ["Pending Commission", formatCurrency(selected.pendingCommission)],
                  ["Paid Commission", formatCurrency(selected.paidCommission)], ["Applied", formatDate(selected.appliedAt)],
                  ["Approved", selected.approvedAt ? formatDate(selected.approvedAt) : "—"],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Portfolio ({selected.portfolio.length} items)</p>
                {selected.portfolio.length === 0
                  ? <p className="text-xs text-slate-400">No portfolio submitted</p>
                  : <div className="flex gap-2">{selected.portfolio.map((_, i) => <div key={i} className="h-16 w-16 rounded-lg bg-slate-100" />)}</div>
                }
              </div>
            </div>
            <DialogFooter>
              {(selected.status === "Pending" || selected.status === "Under Review") && (
                <>
                  <Button variant="destructive" onClick={() => setActionType("reject")}>Reject</Button>
                  <Button onClick={() => handleApprove(selected)} loading={saving}>Approve</Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={actionType === "reject" && !!selected} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {selected?.name}</DialogTitle></DialogHeader>
          <div>
            <Label className="mb-1 block">Rejection Reason *</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a reason…" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} loading={saving}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
