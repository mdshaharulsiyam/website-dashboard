import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { type ApiOrder, type OrderDeliveryStatus } from "@/services/order.service";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { toast } from "sonner";

const DELIVERY_STATUSES: (OrderDeliveryStatus | "all")[] = [
  "all", "pending", "processing", "shipped", "out_for_delivery", "delivered", "canceled", "returned",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-700",
  returned: "bg-slate-100 text-slate-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-600",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderDeliveryStatus | "all">("all");

  const { data, isLoading } = useOrders(search || undefined);
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.delivery_status === statusFilter);
  }, [orders, statusFilter]);

  function handleInvoiceDownload(order: ApiOrder) {
    try {
      downloadInvoicePdf(order);
      toast.success("Invoice PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate invoice PDF");
    }
  }

  const columns: ColumnDef<ApiOrder>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-slate-600">#{(getValue() as string).slice(-8)}</span>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ getValue }) => {
        const u = getValue() as { name: string; email?: string } | string;
        return (
          <div>
            <p className="text-sm font-medium">{typeof u === "object" ? u.name : "—"}</p>
            {typeof u === "object" && u.email && (
              <p className="text-xs text-slate-400">{u.email}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "final_amount",
      header: "Total",
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "delivery_status",
      header: "Delivery",
      cell: ({ getValue }) => {
        const s = (getValue() as string) ?? "pending";
        return (
          <Badge className={`text-xs capitalize ${STATUS_COLORS[s] ?? ""}`}>
            {s.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ getValue }) => {
        const s = (getValue() as string) ?? "pending";
        return (
          <Badge className={`text-xs capitalize ${PAYMENT_COLORS[s] ?? ""}`}>{s}</Badge>
        );
      },
    },
    {
      accessorKey: "order_date",
      header: "Date",
      cell: ({ getValue, row }) => (
        <span className="text-xs text-slate-500">
          {formatDate((getValue() as string) ?? row.original.createdAt ?? "")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: { original: o } }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Download invoice"
            aria-label={`Download invoice for order ${o._id}`}
            onClick={() => handleInvoiceDownload(o)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Select
            value={o.delivery_status ?? "pending"}
            onValueChange={(v) =>
              updateStatus.mutate({ id: o._id, status: v as OrderDeliveryStatus })
            }
          >
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.filter((s) => s !== "all").map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" description={`${filtered.length} orders`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by order ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderDeliveryStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize text-xs">
                {s === "all" ? "All Statuses" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders" description="No orders match your filters." />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
}
