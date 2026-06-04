import React, { useState } from "react";
import { Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Copy, Trash2, Loader2 } from "lucide-react";
import { useCoupons, useCreateCoupon, useDeleteCoupon } from "@/hooks/use-coupons";
import { type ApiCoupon } from "@/services/coupon.service";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function PromotionsPage() {
  const { data, isLoading } = useCoupons();
  const createMut = useCreateCoupon();
  const deleteMut = useDeleteCoupon();

  const [dialog, setDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: generateCode(),
    percentage: 10,
    total_available: 100,
    max_discount: undefined as number | undefined,
    coupon_type: "all" as "all" | "product",
  });

  const coupons = data?.data ?? [];

  async function handleCreate() {
    if (!form.name.trim()) { toast.error("Coupon name required"); return; }
    if (form.percentage <= 0 || form.percentage > 100) { toast.error("Percentage must be 1–100"); return; }
    await createMut.mutateAsync(form);
    setDialog(false);
    setForm({ name: generateCode(), percentage: 10, total_available: 100, max_discount: undefined, coupon_type: "all" });
  }

  const columns: ColumnDef<ApiCoupon>[] = [
    {
      accessorKey: "name",
      header: "Code",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider text-slate-900">
            {getValue() as string}
          </span>
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={() => {
              navigator.clipboard.writeText(getValue() as string);
              toast.success("Copied!");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "percentage",
      header: "Discount",
      cell: ({ getValue, row }) => (
        <div>
          <span className="font-semibold text-amber-600">{getValue() as number}%</span>
          {row.original.max_discount && (
            <span className="text-xs text-slate-400 ml-1">(max ৳{row.original.max_discount})</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "coupon_type",
      header: "Type",
      cell: ({ getValue }) => (
        <Badge className={`text-xs capitalize ${getValue() === "all" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
          {getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: "total_available",
      header: "Available",
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-400">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: { original: c } }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-400"
          onClick={() => setDeleteId(c._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Coupons & Promotions"
          description={`${coupons.length} coupons`}
        />
        <div className="flex gap-2">
          <Link to="/promotions/banners">
            <Button variant="outline" size="sm">Banners</Button>
          </Link>
          <Button size="sm" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4" /> New Coupon
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState title="No coupons" description="Create your first discount coupon." />
      ) : (
        <DataTable columns={columns} data={coupons} />
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1 block">Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className="font-mono"
                />
                <Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, name: generateCode() }))}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Discount % *</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.percentage}
                  onChange={(e) => setForm((p) => ({ ...p, percentage: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label className="mb-1 block">Max Discount (৳)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="No limit"
                  value={form.max_discount ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label className="mb-1 block">Total Available</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.total_available}
                  onChange={(e) => setForm((p) => ({ ...p, total_available: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label className="mb-1 block">Type</Label>
                <Select value={form.coupon_type} onValueChange={(v) => setForm((p) => ({ ...p, coupon_type: v as "all" | "product" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="product">Specific Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this coupon?"
        description="This coupon will no longer be usable."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
