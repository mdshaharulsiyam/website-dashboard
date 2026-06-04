import React, { useState, useRef } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Upload, Download, History } from "lucide-react";
import Papa from "papaparse";
import { mockProducts, mockStockLogs } from "@/data/mock";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatNumber, downloadCSV } from "@/lib/utils";
import type { Product, StockLog } from "@/types";
import { toast } from "sonner";

const LOW_STOCK_THRESHOLD = 5;

interface FlatVariant {
  productId: string;
  productName: string;
  size: string;
  color: string;
  stock: number;
  price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState(mockProducts);
  const [logs] = useState<StockLog[]>(mockStockLogs);
  const [adjusting, setAdjusting] = useState<FlatVariant | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flatVariants: FlatVariant[] = products.flatMap((p: Product) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      size: v.size,
      color: v.color,
      stock: v.stock,
      price: v.price,
    }))
  );

  const lowStock = flatVariants.filter((v) => v.stock < LOW_STOCK_THRESHOLD);
  const outOfStock = flatVariants.filter((v) => v.stock === 0);

  async function handleAdjust() {
    if (!adjusting) return;
    const qty = parseInt(adjustQty);
    if (isNaN(qty)) { toast.error("Enter a valid quantity"); return; }
    if (!adjustReason.trim()) { toast.error("Reason is required"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === adjusting.productId
          ? { ...p, variants: p.variants.map((v) => v.size === adjusting.size && v.color === adjusting.color ? { ...v, stock: Math.max(0, v.stock + qty) } : v) }
          : p
      )
    );
    setSaving(false);
    setAdjusting(null);
    setAdjustQty("");
    setAdjustReason("");
    toast.success("Stock adjusted");
  }

  function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { toast.error("Only CSV files allowed"); return; }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[];
        let updated = 0;
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            variants: p.variants.map((v) => {
              const row = rows.find((r) => r.productId === p.id && r.size === v.size && r.color === v.color);
              if (row && !isNaN(parseInt(row.stock))) {
                updated++;
                return { ...v, stock: Math.max(0, parseInt(row.stock)) };
              }
              return v;
            }),
          }))
        );
        toast.success(`CSV imported — ${updated} variants updated`);
      },
      error: () => toast.error("Failed to parse CSV"),
    });
    e.target.value = "";
  }

  function handleExportCSV() {
    const rows = [
      ["productId", "productName", "size", "color", "stock", "price"],
      ...flatVariants.map((v) => [v.productId, v.productName, v.size, v.color, String(v.stock), String(v.price)]),
    ];
    downloadCSV("inventory.csv", rows);
    toast.success("Inventory exported");
  }

  const variantCols: ColumnDef<FlatVariant>[] = [
    { accessorKey: "productName", header: "Product", cell: ({ row }) => <span className="text-sm font-medium text-slate-800 max-w-[200px] block truncate">{row.original.productName}</span> },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "color", header: "Color" },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.original.stock === 0 ? "destructive" : row.original.stock < LOW_STOCK_THRESHOLD ? "warning" : "success"} className="text-xs">
            {row.original.stock === 0 ? "Out" : row.original.stock}
          </Badge>
          {row.original.stock < LOW_STOCK_THRESHOLD && row.original.stock > 0 && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
        </div>
      ),
      sortingFn: "basic",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => { setAdjusting(row.original); setAdjustQty(""); }}>
          Adjust Stock
        </Button>
      ),
    },
  ];

  const logCols: ColumnDef<StockLog>[] = [
    { accessorKey: "timestamp", header: "Time", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.timestamp, true)}</span> },
    { accessorKey: "productName", header: "Product" },
    { id: "variant", header: "Variant", cell: ({ row }) => <span className="text-xs">{row.original.variantSize} / {row.original.variantColor}</span> },
    { accessorKey: "change", header: "Change", cell: ({ row }) => <Badge variant={row.original.change > 0 ? "success" : "destructive"} className="text-xs">{row.original.change > 0 ? "+" : ""}{row.original.change}</Badge> },
    { accessorKey: "previousQty", header: "Before" },
    { accessorKey: "newQty", header: "After" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "adminName", header: "By" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory Management"
        description={`${flatVariants.length} variants · ${lowStock.length} low stock · ${outOfStock.length} out of stock`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-400">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Variants</p>
            <p className="text-2xl font-bold text-slate-900">{formatNumber(flatVariants.length)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Low Stock ({"<"}{LOW_STOCK_THRESHOLD})</p>
            <p className="text-2xl font-bold text-yellow-600">{formatNumber(lowStock.length)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-400">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{formatNumber(outOfStock.length)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="low">
            Low Stock
            {lowStock.length > 0 && <Badge variant="warning" className="ml-1.5 text-xs">{lowStock.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1.5" />History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <DataTable columns={variantCols} data={flatVariants} pageSize={20} emptyTitle="No variants" />
        </TabsContent>
        <TabsContent value="low">
          {lowStock.length === 0
            ? <EmptyState title="No low stock items" description="All variants are well-stocked." icon={<AlertTriangle className="h-7 w-7 text-slate-300" />} />
            : <DataTable columns={variantCols} data={lowStock} pageSize={20} />
          }
        </TabsContent>
        <TabsContent value="history">
          <DataTable columns={logCols} data={logs} pageSize={20} emptyTitle="No stock history" />
        </TabsContent>
      </Tabs>

      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
          {adjusting && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
                <p className="font-medium">{adjusting.productName}</p>
                <p className="text-slate-500">{adjusting.size} / {adjusting.color}</p>
                <p className="text-slate-500">Current stock: <span className="font-semibold text-slate-900">{adjusting.stock}</span></p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Quantity Change (use negative to reduce, e.g. -5)</label>
                <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="e.g. +10 or -5" />
                {adjustQty && !isNaN(parseInt(adjustQty)) && (
                  <p className="text-xs mt-1 text-slate-500">New stock: <span className="font-semibold">{Math.max(0, adjusting.stock + parseInt(adjustQty))}</span></p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Reason *</label>
                <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="e.g. Stock refill, order fulfillment…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjusting(null)}>Cancel</Button>
            <Button onClick={handleAdjust} loading={saving}>Adjust</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
