import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2, Star, Loader2 } from "lucide-react";
import { useReviews, useDeleteReview } from "@/hooks/use-reviews";
import { type ApiReview } from "@/services/review.service";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { imageUrl } from "@/lib/api-client";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { data, isLoading } = useReviews();
  const deleteMut = useDeleteReview();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "WEBSITE" | "PRODUCT">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reviews = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter((r) => {
      const userName = typeof r.user === "object" ? r.user.name : "";
      const productName =
        r.product && typeof r.product === "object" ? (r.product as { name: string }).name : "";
      if (q && !userName.toLowerCase().includes(q) && !productName.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && r.review_for !== typeFilter) return false;
      return true;
    });
  }, [reviews, search, typeFilter]);

  const columns: ColumnDef<ApiReview>[] = [
    {
      id: "reviewer",
      header: "Reviewer",
      cell: ({ row: { original: r } }) => {
        const user = typeof r.user === "object" ? r.user : null;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-amber-700">
              {user?.img ? (
                <img src={imageUrl(user.img)} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <span className="text-sm font-medium">{user?.name ?? "—"}</span>
          </div>
        );
      },
    },
    {
      id: "product",
      header: "Product / Type",
      cell: ({ row: { original: r } }) => {
        const product = r.product && typeof r.product === "object"
          ? (r.product as { name: string }).name
          : null;
        return (
          <div>
            {product && <p className="text-sm text-slate-700 truncate max-w-[160px]">{product}</p>}
            <Badge
              className={`text-xs ${r.review_for === "WEBSITE" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
            >
              {r.review_for}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ getValue }) => <StarRating rating={getValue() as number} />,
    },
    {
      accessorKey: "description",
      header: "Review",
      cell: ({ getValue }) => (
        <p className="text-xs text-slate-600 max-w-[200px] truncate">{getValue() as string}</p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-400">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: { original: r } }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-400"
          onClick={() => setDeleteId(r._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Reviews" description={`${filtered.length} reviews`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by reviewer or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PRODUCT">Product</SelectItem>
            <SelectItem value="WEBSITE">Website</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No reviews" description="No reviews match your filters." />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this review?"
        description="This action cannot be undone."
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
