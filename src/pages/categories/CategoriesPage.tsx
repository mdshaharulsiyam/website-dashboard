import { PageHeader } from "@/components/shared/page-header";
import {
  useCreateCategoryMutation,
  useCreateServiceMutation,
  useDeleteCategoryMutation,
  useDeleteServiceMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useUpdateServiceMutation,
  type Category,
  type ServiceSummary,
} from "@/store/categoryApi";
import { Button, Card, Input, Modal } from "antd";
import { Edit, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
// const BASE_URL = import.meta.env.VITE_API_URL ?? "http://13.229.171.117:5000";

function assetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/\\/g, "/")}`;
}

type CatModal =
  | { mode: "create" }
  | { mode: "edit"; cat: Category };

type SubModal =
  | { mode: "create"; categoryId: string }
  | { mode: "edit"; sub: ServiceSummary; categoryId: string };

export default function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creatingCat }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updatingCat }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deletingCat }] = useDeleteCategoryMutation();
  const [createService, { isLoading: creatingSub }] = useCreateServiceMutation();
  const [updateService, { isLoading: updatingSub }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: deletingSub }] = useDeleteServiceMutation();

  const categories = data?.data ?? [];

  // ── Category modal ────────────────────────────────────────────
  const [catModal, setCatModal] = useState<CatModal | null>(null);
  const [catName, setCatName] = useState("");
  const [catImgFile, setCatImgFile] = useState<File | null>(null);
  const catFileRef = useRef<HTMLInputElement>(null);

  // ── Sub-category modal ────────────────────────────────────────
  const [subModal, setSubModal] = useState<SubModal | null>(null);
  const [subName, setSubName] = useState("");
  const [subImgFile, setSubImgFile] = useState<File | null>(null);
  const subFileRef = useRef<HTMLInputElement>(null);

  // ── Delete confirm ────────────────────────────────────────────
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  // ── Category handlers ─────────────────────────────────────────
  function openCreateCat() {
    setCatName("");
    setCatImgFile(null);
    setCatModal({ mode: "create" });
  }

  function openEditCat(cat: Category) {
    setCatName(cat.name);
    setCatImgFile(null);
    setCatModal({ mode: "edit", cat });
  }

  async function handleCatSave() {
    if (!catName.trim()) return;
    const fd = new FormData();
    fd.append("name", catName.trim());
    if (catImgFile) fd.append("img", catImgFile);

    try {
      if (catModal?.mode === "create") {
        await createCategory(fd).unwrap();
        toast.success("Category created");
      } else if (catModal?.mode === "edit") {
        await updateCategory({ id: catModal.cat._id, body: fd }).unwrap();
        toast.success("Category updated");
      }
      setCatModal(null);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong",
      );
    }
  }

  // ── Sub-category handlers ─────────────────────────────────────
  function openCreateSub(categoryId: string) {
    setSubName("");
    setSubImgFile(null);
    setSubModal({ mode: "create", categoryId });
  }

  function openEditSub(sub: ServiceSummary, categoryId: string) {
    setSubName(sub.name);
    setSubImgFile(null);
    setSubModal({ mode: "edit", sub, categoryId });
  }

  async function handleSubSave() {
    if (!subName.trim()) return;
    const fd = new FormData();
    fd.append("name", subName.trim());
    if (subImgFile) fd.append("img", subImgFile);

    try {
      if (subModal?.mode === "create") {
        fd.append("category", subModal.categoryId);
        await createService(fd).unwrap();
        toast.success("Sub-category created");
      } else if (subModal?.mode === "edit") {
        await updateService({ id: subModal.sub._id, body: fd }).unwrap();
        toast.success("Sub-category updated");
      }
      setSubModal(null);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong",
      );
    }
  }

  // ── Delete handlers ───────────────────────────────────────────
  async function confirmDeleteCat() {
    if (!deleteCatId) return;
    try {
      await deleteCategory(deleteCatId).unwrap();
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleteCatId(null);
    }
  }

  async function confirmDeleteSub() {
    if (!deleteSubId) return;
    try {
      await deleteService(deleteSubId).unwrap();
      toast.success("Sub-category deleted");
    } catch {
      toast.error("Failed to delete sub-category");
    } finally {
      setDeleteSubId(null);
    }
  }

  const catSaving = creatingCat || updatingCat;
  const subSaving = creatingSub || updatingSub;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        description={`${categories.length} categories`}
        actions={
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openCreateCat}
          >
            New Category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-slate-400 text-sm">
          No categories yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat._id} size="small">
              {/* Category row */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-slate-200">
                  {cat.img ? (
                    <img
                      src={assetUrl(cat.img)}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-400">
                    {cat.services?.length ?? 0} sub-categor
                    {(cat.services?.length ?? 0) === 1 ? "y" : "ies"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="small"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => openCreateSub(cat._id)}
                  >
                    Add Sub
                  </Button>
                  <Button
                    size="small"
                    icon={<Edit className="h-3.5 w-3.5" />}
                    onClick={() => openEditCat(cat)}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setDeleteCatId(cat._id)}
                  />
                </div>
              </div>

              {/* Sub-categories */}
              {cat.services && cat.services.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {cat.services.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
                    >
                      <span className="text-xs text-slate-700">{sub.name}</span>
                      <button
                        type="button"
                        onClick={() => openEditSub(sub, cat._id)}
                        className="text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteSubId(sub._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── Category Modal ── */}
      <Modal
        open={!!catModal}
        title={catModal?.mode === "create" ? "New Category" : "Edit Category"}
        onCancel={() => setCatModal(null)}
        onOk={handleCatSave}
        okText={catModal?.mode === "create" ? "Create" : "Save Changes"}
        confirmLoading={catSaving}
        okButtonProps={{ disabled: !catName.trim() }}
        destroyOnClose
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name *</label>
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Hair Care"
              onPressEnter={handleCatSave}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Image{catModal?.mode === "edit" ? " (upload to replace current)" : " *"}
            </label>
            <div
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => catFileRef.current?.click()}
            >
              {catImgFile ? (
                <div className="flex items-center gap-2 justify-center">
                  <img
                    src={URL.createObjectURL(catImgFile)}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <span className="text-sm text-slate-600">{catImgFile.name}</span>
                </div>
              ) : catModal?.mode === "edit" && catModal.cat.img ? (
                <div className="flex items-center gap-2 justify-center">
                  <img
                    src={assetUrl(catModal.cat.img)}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs text-slate-400">Current image — click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                  <p className="text-xs">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={catFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCatImgFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </Modal>

      {/* ── Sub-category Modal ── */}
      <Modal
        open={!!subModal}
        title={subModal?.mode === "create" ? "New Sub-category" : "Edit Sub-category"}
        onCancel={() => setSubModal(null)}
        onOk={handleSubSave}
        okText={subModal?.mode === "create" ? "Create" : "Save Changes"}
        confirmLoading={subSaving}
        okButtonProps={{ disabled: !subName.trim() }}
        destroyOnClose
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name *</label>
            <Input
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. Hair Cut"
              onPressEnter={handleSubSave}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Image{subModal?.mode === "edit" ? " (upload to replace current)" : ""}
            </label>
            <div
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => subFileRef.current?.click()}
            >
              {subImgFile ? (
                <div className="flex items-center gap-2 justify-center">
                  <img
                    src={URL.createObjectURL(subImgFile)}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <span className="text-sm text-slate-600">{subImgFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                  <p className="text-xs">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={subFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSubImgFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Category Confirm ── */}
      <Modal
        open={!!deleteCatId}
        title="Delete Category?"
        onCancel={() => setDeleteCatId(null)}
        onOk={confirmDeleteCat}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deletingCat }}
        cancelText="Cancel"
      >
        <p className="text-sm text-slate-600">
          This will deactivate the category and all its sub-categories. Products will not be
          affected.
        </p>
      </Modal>

      {/* ── Delete Sub-category Confirm ── */}
      <Modal
        open={!!deleteSubId}
        title="Delete Sub-category?"
        onCancel={() => setDeleteSubId(null)}
        onOk={confirmDeleteSub}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deletingSub }}
        cancelText="Cancel"
      >
        <p className="text-sm text-slate-600">
          This sub-category will be deactivated. Existing products will not be affected.
        </p>
      </Modal>
    </div>
  );
}
