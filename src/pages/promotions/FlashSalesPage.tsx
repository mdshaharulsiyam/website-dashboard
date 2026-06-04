import React, { useState, useEffect } from "react";
import { Plus, Zap, Package } from "lucide-react";
import { mockFlashSales } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate, calcDiscountPercent } from "@/lib/utils";
import type { FlashSale } from "@/types";
import { toast } from "sonner";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    function update() {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return <span className="font-mono text-sm font-bold text-red-600">{remaining}</span>;
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>(mockFlashSales);
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState({ productId: "", productName: "", originalPrice: 0, salePrice: 0, startTime: "", endTime: "" });
  const [saving, setSaving] = useState(false);

  function validateForm() {
    if (!form.productId.trim()) { toast.error("Product ID required"); return false; }
    if (form.salePrice <= 0) { toast.error("Sale price must be > 0"); return false; }
    if (form.salePrice >= form.originalPrice && form.originalPrice > 0) { toast.error("Sale price must be less than original price"); return false; }
    if (!form.startTime || !form.endTime) { toast.error("Both start and end times are required"); return false; }
    if (new Date(form.startTime) >= new Date(form.endTime)) { toast.error("End time must be after start time"); return false; }
    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSales((prev) => [...prev, {
      id: `fs-${Date.now()}`, productId: form.productId, productName: form.productName || form.productId,
      productImage: "/placeholder-product.jpg", originalPrice: form.originalPrice, salePrice: form.salePrice,
      startTime: form.startTime, endTime: form.endTime, status: "scheduled",
    }]);
    setSaving(false);
    setCreateDialog(false);
    toast.success("Flash sale scheduled");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Flash Sales"
        description="Time-limited sale prices with live countdown"
        actions={
          <Button size="sm" onClick={() => { setForm({ productId: "", productName: "", originalPrice: 0, salePrice: 0, startTime: "", endTime: "" }); setCreateDialog(true); }}>
            <Plus className="h-4 w-4" />New Flash Sale
          </Button>
        }
      />

      {sales.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No flash sales configured</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map((sale) => (
            <Card key={sale.id} className={sale.status === "active" ? "border-amber-300 shadow-md" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{sale.productName}</CardTitle>
                  <Badge
                    variant={sale.status === "active" ? "default" : sale.status === "scheduled" ? "warning" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {sale.status === "active" && <Zap className="h-3 w-3 mr-1" />}{sale.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-28 w-full rounded-lg bg-slate-100 flex items-center justify-center">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(sale.salePrice)}</p>
                    {sale.originalPrice > 0 && (
                      <p className="text-xs text-slate-400 line-through">{formatCurrency(sale.originalPrice)}</p>
                    )}
                  </div>
                  {sale.originalPrice > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-sm font-bold">
                      -{calcDiscountPercent(sale.originalPrice, sale.salePrice)}%
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Start: {formatDate(sale.startTime, true)}</p>
                  <p>End: {formatDate(sale.endTime, true)}</p>
                </div>
                {sale.status === "active" && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                    <span className="text-xs text-slate-500">Ends in:</span>
                    <CountdownTimer endTime={sale.endTime} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Flash Sale</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Product ID *</Label>
                <Input value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))} placeholder="e.g. p1" />
              </div>
              <div>
                <Label className="mb-1 block">Product Name</Label>
                <Input value={form.productName} onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))} placeholder="Display name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Original Price (৳)</Label>
                <Input type="number" min={0} value={form.originalPrice} onChange={(e) => setForm((p) => ({ ...p, originalPrice: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="mb-1 block">Sale Price (৳) *</Label>
                <Input type="number" min={1} value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: Number(e.target.value) }))} />
                {form.originalPrice > 0 && form.salePrice > 0 && form.salePrice < form.originalPrice && (
                  <p className="text-xs text-emerald-600 mt-1">Discount: {calcDiscountPercent(form.originalPrice, form.salePrice)}%</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Start Time *</Label>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div>
                <Label className="mb-1 block">End Time *</Label>
                <Input type="datetime-local" value={form.endTime} min={form.startTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Schedule Flash Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
