import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Loader2, UserCheck, UserX } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency, formatDate, BEE_LEVEL_COLORS, getInitials, downloadCSV } from "@/lib/utils";
import { useCustomers, useToggleCustomerBlock } from "@/hooks/use-customers";
import { mapApiCustomerToCustomer } from "@/services/customer.service";
import type { BeeLevel, Customer } from "@/types";
import { toast } from "sonner";

const BEE_LEVELS: (BeeLevel | "all")[] = ["all", "Larva", "Worker", "Drone", "Queen", "Royal"];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<BeeLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Banned">("all");
  const [banTarget, setBanTarget] = useState<Customer | null>(null);

  const { data, isError, isLoading, refetch } = useCustomers();
  const toggleCustomerBlock = useToggleCustomerBlock();

  const customers = useMemo(
    () => (data?.data ?? []).map(mapApiCustomerToCustomer),
    [data?.data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const phone = customer.phone ?? "";
      const matchesSearch =
        !q ||
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        phone.includes(q);

      if (!matchesSearch) return false;
      if (levelFilter !== "all" && customer.beeLevel !== levelFilter) return false;
      if (statusFilter !== "all" && customer.status !== statusFilter) return false;
      return true;
    });
  }, [customers, levelFilter, search, statusFilter]);

  function handleToggleBan() {
    if (!banTarget) return;

    toggleCustomerBlock.mutate(banTarget.id, {
      onSuccess: () => setBanTarget(null),
    });
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("No customers to export");
      return;
    }

    const rows = [
      ["ID", "Name", "Email", "Phone", "Bee Level", "Orders", "Total Spend", "Status", "Joined"],
      ...filtered.map((customer) => [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.beeLevel,
        String(customer.totalOrders),
        String(customer.totalSpend),
        customer.status,
        formatDate(customer.joinedAt),
      ]),
    ];

    downloadCSV(`customers-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success(`Exported ${filtered.length} customers`);
  }

  const columns: ColumnDef<Customer>[] = [
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={`text-xs font-semibold ${BEE_LEVEL_COLORS[customer.beeLevel]}`}>
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{customer.name}</p>
              <p className="text-xs text-slate-400 truncate">{customer.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "beeLevel",
      header: "Bee Level",
      cell: ({ row }) => (
        <Badge className={`text-xs ${BEE_LEVEL_COLORS[row.original.beeLevel]}`}>
          {row.original.beeLevel}
        </Badge>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => <span className="font-medium">{row.original.totalOrders}</span>,
      sortingFn: "basic",
    },
    {
      accessorKey: "totalSpend",
      header: "Total Spend",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{formatCurrency(row.original.totalSpend)}</span>
      ),
      sortingFn: "basic",
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.lastActive)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "success" : "destructive"} className="text-xs">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <div className="flex gap-1">
            <Link to={`/customers/${customer.id}`}>
              <Button variant="ghost" size="icon-sm" title="View profile">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              title={customer.status === "Banned" ? "Unban" : "Ban"}
              className={customer.status === "Banned" ? "text-emerald-600" : "text-red-500"}
              onClick={() => setBanTarget(customer)}
              disabled={toggleCustomerBlock.isPending}
            >
              {customer.status === "Banned" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={`${customers.length} total | ${customers.filter((customer) => customer.status === "Banned").length} banned`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link to="/customers/bee-levels">
              <Button variant="outline" size="sm">Bee Level Config</Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
        <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as BeeLevel | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Bee Level" />
          </SelectTrigger>
          <SelectContent>
            {BEE_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level === "all" ? "All Levels" : level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        {(search || levelFilter !== "all" || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setLevelFilter("all");
              setStatusFilter("all");
            }}
          >
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
          <p className="text-sm font-medium text-slate-700">Unable to load customers.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle={search ? "No customers match your search" : "No customers yet"}
          emptyDescription="Customers will appear here after they register."
          pageSize={20}
        />
      )}

      <ConfirmDialog
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={banTarget?.status === "Banned" ? `Unban ${banTarget?.name}?` : `Ban ${banTarget?.name}?`}
        description={
          banTarget?.status === "Banned"
            ? "This will restore the customer's access."
            : "This will prevent the customer from logging in or placing orders."
        }
        confirmLabel={banTarget?.status === "Banned" ? "Unban" : "Ban Customer"}
        variant={banTarget?.status === "Banned" ? "default" : "destructive"}
        onConfirm={handleToggleBan}
        loading={toggleCustomerBlock.isPending}
      />
    </div>
  );
}
