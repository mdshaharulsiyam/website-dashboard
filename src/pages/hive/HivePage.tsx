import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Flag, Star, Trash2, Share2 } from "lucide-react";
import { mockWardrobePosts } from "@/data/mock";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, BEE_LEVEL_COLORS } from "@/lib/utils";
import type { WardrobePost } from "@/types";
import { toast } from "sonner";

const STATUS_OPTS = ["all", "Published", "Flagged", "Featured", "Removed"] as const;

export default function HivePage() {
  const [posts, setPosts] = useState<WardrobePost[]>(mockWardrobePosts);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [removeTarget, setRemoveTarget] = useState<WardrobePost | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return posts;
    return posts.filter((p) => p.status === statusFilter);
  }, [posts, statusFilter]);

  const flaggedCount = posts.filter((p) => p.status === "Flagged").length;
  const reportedCount = posts.filter((p) => p.reportCount > 0).length;

  function toggleFeature(post: WardrobePost) {
    setPosts((prev) => prev.map((p) => p.id === post.id
      ? { ...p, isFeatured: !p.isFeatured, status: p.isFeatured ? "Published" : "Featured" }
      : p
    ));
    toast.success(post.isFeatured ? "Post unfeatured" : "Post featured — pinned to homepage");
  }

  function flagPost(post: WardrobePost) {
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: "Flagged" } : p));
    toast.success("Post flagged for review");
  }

  function removePost() {
    if (!removeTarget) return;
    setPosts((prev) => prev.map((p) => p.id === removeTarget.id ? { ...p, status: "Removed" } : p));
    toast.success("Post removed");
    setRemoveTarget(null);
  }

  const columns: ColumnDef<WardrobePost>[] = [
    {
      id: "post",
      header: "Post",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-300 text-xs font-bold">IMG</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate max-w-[200px]">{p.caption}</p>
              <p className="text-xs text-slate-400 truncate">{p.productName ?? "No product tagged"}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-medium">{row.original.customerName}</p>
          <Badge className={`text-xs mt-0.5 ${BEE_LEVEL_COLORS[row.original.customerBeeLevel]}`}>{row.original.customerBeeLevel}</Badge>
        </div>
      ),
    },
    {
      id: "shares",
      header: "Shares",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Share2 className="h-3 w-3" />
            <span>{p.totalShares}</span>
            <span className="text-slate-300">|</span>
            <span className="text-green-600">W:{p.shares.whatsapp}</span>
            <span className="text-blue-500">T:{p.shares.twitter}</span>
            <span className="text-blue-700">F:{p.shares.facebook}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === "Featured" ? "default" : s === "Flagged" ? "warning" : s === "Removed" ? "destructive" : "secondary"} className="text-xs">
            {s}
          </Badge>
        );
      },
    },
    {
      id: "reports",
      header: "Reports",
      cell: ({ row }) => row.original.reportCount > 0
        ? <Badge variant="destructive" className="text-xs">{row.original.reportCount} report{row.original.reportCount > 1 ? "s" : ""}</Badge>
        : <span className="text-xs text-slate-400">—</span>,
    },
    { accessorKey: "createdAt", header: "Posted", cell: ({ row }) => <span className="text-xs text-slate-400">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" title={p.isFeatured ? "Unfeature" : "Feature"} onClick={() => toggleFeature(p)} className={p.isFeatured ? "text-amber-500" : ""}>
              <Star className="h-4 w-4" />
            </Button>
            {p.status !== "Flagged" && p.status !== "Removed" && (
              <Button variant="ghost" size="icon-sm" title="Flag" onClick={() => flagPost(p)} className="text-yellow-600">
                <Flag className="h-4 w-4" />
              </Button>
            )}
            {p.status !== "Removed" && (
              <Button variant="ghost" size="icon-sm" title="Remove" onClick={() => setRemoveTarget(p)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Hive — Wardrobe Moderation"
        description={`${posts.length} posts · ${flaggedCount} flagged · ${reportedCount} reported`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["Published", "Featured", "Flagged", "Removed"].map((s) => {
          const count = posts.filter((p) => p.status === s).length;
          return (
            <Card key={s} className="cursor-pointer hover:border-amber-400 transition-colors" onClick={() => setStatusFilter(s)}>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">{s}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Posts" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        {statusFilter !== "all" && <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}>Clear</Button>}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No posts found"
        emptyDescription="Wardrobe posts from customers will appear here."
        pageSize={20}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this post?"
        description="The post will be hidden from the storefront immediately."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={removePost}
      />
    </div>
  );
}
