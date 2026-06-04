import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2, Plus, Trash2, UserCog } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getInitials, formatDate } from "@/lib/utils";
import {
  useGetAllAdminsQuery,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useChangeRoleMutation,
  AuthUser,
} from "@/store/authApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MakeAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Banned">("all");

  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<AuthUser | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", confirm_password: "" });

  const { data, isLoading, isError, refetch } = useGetAllAdminsQuery(
    { search, status: statusFilter === "all" ? undefined : statusFilter },
  );

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();
  const [changeRole, { isLoading: isChangingRole }] = useChangeRoleMutation();

  const admins = data?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAdmin(createForm).unwrap();
      if (res.success) {
        toast.success(res.message);
        setIsCreateOpen(false);
        setCreateForm({ name: "", email: "", password: "", confirm_password: "" });
      } else {
        toast.error(res.message || "Failed to create admin");
      }
    } catch (error: any) {
      toast.error(error.data?.message || error.message || "Failed to create admin");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteAdmin({ id: deleteTarget._id }).unwrap();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to delete admin");
      }
    } catch (error: any) {
      toast.error(error.data?.message || error.message || "Failed to delete admin");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleChangeRole = async () => {
    if (!roleChangeTarget) return;
    try {
      const res = await changeRole({ id: roleChangeTarget._id, role: "USER" }).unwrap();
      if (res.success) {
        toast.success(`Role changed successfully for ${roleChangeTarget.name}`);
      } else {
        toast.error(res.message || "Failed to change role");
      }
    } catch (error: any) {
      toast.error(error.data?.message || error.message || "Failed to change role");
    } finally {
      setRoleChangeTarget(null);
    }
  };

  const columns: ColumnDef<AuthUser>[] = [
    {
      id: "admin",
      header: "Admin",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold bg-amber-500 text-white">
                {getInitials(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{admin.name}</p>
              <p className="text-xs text-slate-400 truncate">{admin.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge className="text-xs bg-slate-900 text-white hover:bg-slate-800">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDate(row.original.createdAt || "")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={!row.original.block ? "success" : "destructive"} className="text-xs">
          {!row.original.block ? "Active" : "Banned"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Change back to User"
              onClick={() => setRoleChangeTarget(admin)}
            >
              <UserCog className="h-4 w-4 text-slate-500 hover:text-amber-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Delete Admin"
              onClick={() => setDeleteTarget(admin)}
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manage Admins"
        description="View, create, and manage admin users."
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    required
                    placeholder="Admin Name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    placeholder="admin@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    required
                    type="password"
                    placeholder="********"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    required
                    type="password"
                    placeholder="********"
                    value={createForm.confirm_password}
                    onChange={(e) => setCreateForm({ ...createForm, confirm_password: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="bg-amber-500 hover:bg-amber-600">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Admin
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
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
        {(search || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
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
          <p className="text-sm font-medium text-slate-700">Unable to load admins.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          emptyTitle={search ? "No admins match your search" : "No admins yet"}
          emptyDescription="There are no administrators to display."
          pageSize={20}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        description="This action cannot be undone. This admin will be permanently removed."
        confirmLabel="Delete Admin"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
      />

      <ConfirmDialog
        open={!!roleChangeTarget}
        onOpenChange={(open) => !open && setRoleChangeTarget(null)}
        title={`Change ${roleChangeTarget?.name} to User?`}
        description="This admin will lose administrative access and become a regular user."
        confirmLabel="Change Role"
        variant="default"
        onConfirm={handleChangeRole}
        loading={isChangingRole}
      />
    </div>
  );
}
