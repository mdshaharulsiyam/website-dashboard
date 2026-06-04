import { useMemo, useState } from "react";
import { CircleHelp, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCreateFaq, useDeleteFaq, useFaqs, useUpdateFaq } from "@/hooks/use-faq";
import { type ApiFaq, type SaveFaqPayload } from "@/services/faq.service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type FaqForm = SaveFaqPayload;

const EMPTY_FORM: FaqForm = {
  question: "",
  answer: "",
  category: "General",
};

function faqToForm(faq: ApiFaq): FaqForm {
  return {
    question: faq.question ?? "",
    answer: faq.answer ?? "",
    category: faq.category ?? "General",
  };
}

export default function FaqPage() {
  const { data, isLoading, isError, refetch } = useFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ApiFaq | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM);

  const faqs = data?.data ?? [];
  const isSaving = createFaq.isPending || updateFaq.isPending;

  const filteredFaqs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faqs;

    return faqs.filter((faq) =>
      [faq.question, faq.answer, faq.category]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [faqs, search]);

  function resetDialog() {
    setDialogOpen(false);
    setEditingFaq(null);
    setForm(EMPTY_FORM);
  }

  function openCreateDialog() {
    setEditingFaq(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(faq: ApiFaq) {
    setEditingFaq(faq);
    setForm(faqToForm(faq));
    setDialogOpen(true);
  }

  function validateForm() {
    if (!form.question.trim()) {
      toast.error("Question required");
      return false;
    }
    if (!form.answer.trim()) {
      toast.error("Answer required");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category?.trim() || "General",
    };

    if (editingFaq) {
      await updateFaq.mutateAsync({ id: editingFaq._id, payload });
    } else {
      await createFaq.mutateAsync(payload);
    }

    resetDialog();
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white">
        <p className="text-sm font-medium text-red-500">Unable to load FAQs.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="FAQs"
        description={`${faqs.length} website questions`}
        actions={
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New FAQ
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search FAQs..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <EmptyState
          title={search ? "No matching FAQs" : "No FAQs"}
          description={search ? "Try a different search term." : "Create your first website FAQ."}
          icon={<CircleHelp className="h-7 w-7 text-slate-400" />}
        />
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <Card key={faq._id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100">
                  <CircleHelp className="h-5 w-5 text-amber-700" />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                    <Badge variant="secondary">{faq.category || "General"}</Badge>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{faq.answer}</p>
                  {faq.updatedAt && (
                    <p className="text-xs text-slate-400">Updated {formatDate(faq.updatedAt)}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-500"
                    title="Edit FAQ"
                    onClick={() => openEditDialog(faq)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-500"
                    title="Delete FAQ"
                    onClick={() => setDeleteId(faq._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : resetDialog())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="mb-1 block">Question *</Label>
              <Input
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                placeholder="What is LooksBee?"
              />
            </div>

            <div>
              <Label className="mb-1 block">Answer *</Label>
              <Textarea
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                rows={7}
                placeholder="Write the answer shown on the website."
              />
            </div>

            <div>
              <Label className="mb-1 block">Category</Label>
              <Input
                value={form.category ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="General"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingFaq ? "Update FAQ" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this FAQ?"
        description="This will remove the question from the website."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteFaq.isPending}
        onConfirm={() => {
          if (deleteId) deleteFaq.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
