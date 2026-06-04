import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useDeleteProductMutation, useGetProductsQuery, type Product } from "@/store/productApi";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Loader2, Package, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// const BASE_URL = import.meta.env.VITE_API_URL ?? "http://13.229.171.117:5000";
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function bannerUrl(path: string | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/\\/g, "/")}`;
}

const FLAG_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  popular: "bg-amber-100 text-amber-700",
  trending: "bg-pink-100 text-pink-700",
  "limited edition": "bg-purple-100 text-purple-700",
  featured: "bg-emerald-100 text-emerald-700",
  offer: "bg-red-100 text-red-700",
  "best choice": "bg-teal-100 text-teal-700",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetProductsQuery({ page, limit: 20 });
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : products;

  const columns: ColumnDef<Product>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row: { original: p } }) => {
        const img = bannerUrl(p.banner);
        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              {img ? (
                <img src={img} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 m-3.5 text-slate-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate max-w-50">{p.name}</p>
              {p.flag && (
                <Badge className={`text-[10px] capitalize mt-0.5 ${FLAG_COLORS[p.flag] ?? "bg-slate-100 text-slate-600"}`}>
                  {p.flag}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row: { original: p } }) => (
        <div className="text-sm">
          <p className="font-medium text-slate-700">{p.category_name ?? "—"}</p>
          {p.sub_category_name && (
            <p className="text-xs text-slate-400 mt-0.5">{p.sub_category_name}</p>
          )}
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row: { original: p } }) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(p.price_after_discount ?? p.price)}
          </p>
          {p.discount > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-400 line-through">{formatCurrency(p.price)}</span>
              <Badge className="text-[10px] bg-red-100 text-red-600 px-1 py-0">{p.discount}% off</Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: ({ row: { original: p } }) => (
        <div>
          {p.averageRating ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-amber-600">{Number(p.averageRating).toFixed(1)}</span>
              <span className="text-xs text-slate-400">({p.totalReviews ?? 0})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No reviews</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-1 justify-end">
          <Link to={`/products/${p._id}/edit`}>
            <Button variant="ghost" size="icon-sm"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-400 hover:text-red-600"
            onClick={() => setDeleteId(p._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description={pagination ? `${pagination.totalItems} total products` : ""}
        actions={
          <Link to="/products/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No products" description="No products match your search." />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
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
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this product?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteProduct(deleteId).unwrap();
            toast.success("Product deleted");
          } catch {
            toast.error("Failed to delete product");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
