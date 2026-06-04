import { type ChangeEvent, useRef, useState } from "react";
import { ExternalLink, ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/hooks/use-banners";
import { type ApiBanner } from "@/services/banner.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { imageUrl } from "@/lib/api-client";
import { toast } from "sonner";

type BannerForm = {
  heading: string;
  description: string;
  offer: string;
  button: string;
  link: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const EMPTY_FORM: BannerForm = {
  heading: "",
  description: "",
  offer: "",
  button: "Shop Now",
  link: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-yellow-100 text-yellow-700",
  ended: "bg-slate-100 text-slate-600",
};

function bannerStatus(banner: ApiBanner): "active" | "scheduled" | "ended" {
  const now = new Date();
  if (!banner.is_active) return "ended";
  if (banner.start_date && new Date(banner.start_date) > now) return "scheduled";
  if (banner.end_date && new Date(banner.end_date) < now) return "ended";
  return "active";
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function bannerToForm(banner: ApiBanner): BannerForm {
  return {
    heading: banner.heading ?? "",
    description: banner.description ?? "",
    offer: banner.offer ?? "",
    button: banner.button ?? "Shop Now",
    link: banner.link ?? "",
    start_date: toDateInputValue(banner.start_date),
    end_date: toDateInputValue(banner.end_date),
    is_active: banner.is_active ?? true,
  };
}

function bannerDates(banner: ApiBanner) {
  if (!banner.start_date && !banner.end_date) return "No dates set";
  return `${banner.start_date ? formatDate(banner.start_date) : "Any time"} to ${
    banner.end_date ? formatDate(banner.end_date) : "No end date"
  }`;
}

export default function BannersPage() {
  const { data, isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ApiBanner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const banners = data?.data ?? [];
  const isSaving = createBanner.isPending || updateBanner.isPending;

  function resetDialog() {
    setDialogOpen(false);
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setImgFile(null);
    setImgPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openCreateDialog() {
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setImgFile(null);
    setImgPreview(null);
    setDialogOpen(true);
  }

  function openEditDialog(banner: ApiBanner) {
    setEditingBanner(banner);
    setForm(bannerToForm(banner));
    setImgFile(null);
    setImgPreview(banner.img ? imageUrl(banner.img) : null);
    setDialogOpen(true);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  }

  function validateForm() {
    if (!form.heading.trim()) {
      toast.error("Heading required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description required");
      return false;
    }
    if (!form.offer.trim()) {
      toast.error("Offer text required");
      return false;
    }
    if (!form.button.trim()) {
      toast.error("Button text required");
      return false;
    }
    if (!form.link.trim()) {
      toast.error("Link required");
      return false;
    }
    if (!form.start_date || !form.end_date) {
      toast.error("Both dates required");
      return false;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error("End date must be after start date");
      return false;
    }
    if (!editingBanner && !imgFile) {
      toast.error("Banner image required");
      return false;
    }
    return true;
  }

  function buildPayload() {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
    if (imgFile) payload.append("img", imgFile);
    return payload;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    const payload = buildPayload();
    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner._id, payload });
    } else {
      await createBanner.mutateAsync(payload);
    }
    resetDialog();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Banners"
        description={`${banners.length} website banners`}
        actions={
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Banner
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : banners.length === 0 ? (
        <EmptyState title="No banners" description="Create your first promotional banner." />
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => {
            const status = bannerStatus(banner);

            return (
              <Card key={banner._id}>
                <CardContent className="flex flex-col gap-4 py-3 sm:flex-row sm:items-center">
                  <div className="h-24 w-full overflow-hidden rounded bg-slate-100 sm:h-20 sm:w-32 sm:shrink-0">
                    {banner.img ? (
                      <img src={imageUrl(banner.img)} alt={banner.heading} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{banner.heading}</p>
                      <Badge className={`text-xs capitalize ${STATUS_COLORS[status]}`}>{status}</Badge>
                    </div>
                    <p className="line-clamp-1 text-xs text-slate-500">{banner.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-amber-600">{banner.offer}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">{bannerDates(banner)}</span>
                    </div>
                    {banner.link && (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-500 hover:underline"
                      >
                        <span className="truncate">{banner.link}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-slate-500"
                      onClick={() => openEditDialog(banner)}
                      title="Edit banner"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-500"
                      onClick={() => setDeleteId(banner._id)}
                      title="Delete banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : resetDialog())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            <div>
              <Label className="mb-1 block">Banner Image {editingBanner ? "" : "*"}</Label>
              <div
                className="overflow-hidden rounded-lg border-2 border-dashed border-slate-200 transition-colors hover:border-amber-400"
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => fileRef.current?.click()}
                >
                  {imgPreview ? (
                    <img src={imgPreview} alt="Banner preview" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-7 text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                      <p className="text-xs">Click to upload</p>
                    </div>
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="mb-1 block">Heading *</Label>
                <Input
                  value={form.heading}
                  maxLength={50}
                  onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
                  placeholder="Summer Sale 2026"
                />
              </div>

              <div className="col-span-2">
                <Label className="mb-1 block">Description *</Label>
                <Input
                  value={form.description}
                  maxLength={80}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Fresh arrivals for the season"
                />
              </div>

              <div>
                <Label className="mb-1 block">Offer Text *</Label>
                <Input
                  value={form.offer}
                  maxLength={30}
                  onChange={(event) => setForm((prev) => ({ ...prev, offer: event.target.value }))}
                  placeholder="Up to 50% off"
                />
              </div>

              <div>
                <Label className="mb-1 block">Button Text *</Label>
                <Input
                  value={form.button}
                  maxLength={20}
                  onChange={(event) => setForm((prev) => ({ ...prev, button: event.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <Label className="mb-1 block">Link *</Label>
                <Input
                  value={form.link}
                  onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                  placeholder="https://example.com/collection"
                />
              </div>

              <div>
                <Label className="mb-1 block">Start Date *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                />
              </div>

              <div>
                <Label className="mb-1 block">End Date *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  min={form.start_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <Label>Show banner on website</Label>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBanner ? "Update Banner" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this banner?"
        description="This will remove the banner from the website immediately."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteBanner.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
