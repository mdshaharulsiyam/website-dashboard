import React, { useState } from "react";
import { mockDesignSubmissions } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import type { DesignSubmission } from "@/types";
import { toast } from "sonner";
import { CheckCircle, XCircle, Package } from "lucide-react";

export default function DesignApprovalsPage() {
  const [submissions, setSubmissions] = useState<DesignSubmission[]>(mockDesignSubmissions);
  const [selected, setSelected] = useState<DesignSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [saving, setSaving] = useState(false);

  const pending = submissions.filter((s) => s.status === "Pending");

  async function handleApprove(s: DesignSubmission) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmissions((prev) => prev.map((d) => d.id === s.id ? { ...d, status: "Approved", reviewedAt: new Date().toISOString() } : d));
    setSaving(false);
    setSelected(null);
    toast.success(`Design "${s.designName}" approved — product draft created`);
  }

  async function handleReject() {
    if (!selected) return;
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmissions((prev) => prev.map((d) => d.id === selected.id ? { ...d, status: "Rejected", rejectionReason: rejectReason, reviewedAt: new Date().toISOString() } : d));
    setSaving(false);
    setSelected(null);
    setRejectReason("");
    toast.success(`Design "${selected.designName}" rejected — email sent to vendor`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Design Approval Queue"
        description={`${pending.length} pending · ${submissions.filter((s) => s.status === "Approved").length} approved · ${submissions.filter((s) => s.status === "Rejected").length} rejected`}
      />

      {pending.length === 0 && (
        <EmptyState
          title="No pending designs"
          description="All submitted designs have been reviewed."
          icon={<CheckCircle className="h-7 w-7 text-emerald-400" />}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((s) => (
          <Card key={s.id} className={s.status === "Rejected" ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">{s.designName}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">by {s.vendorName}</p>
                </div>
                <Badge variant={s.status === "Approved" ? "success" : s.status === "Rejected" ? "destructive" : "warning"} className="text-xs shrink-0">
                  {s.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-32 w-full rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="h-10 w-10 text-slate-300" />
              </div>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p><span className="font-medium">Category:</span> {s.category}</p>
                <p className="line-clamp-2">{s.description}</p>
                <p><span className="font-medium">Submitted:</span> {formatDate(s.submittedAt)}</p>
                {s.rejectionReason && <p className="text-red-500"><span className="font-medium">Rejected:</span> {s.rejectionReason}</p>}
              </div>
              {s.status === "Pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="flex-1" onClick={() => handleApprove(s)} loading={saving}>
                    <CheckCircle className="h-4 w-4" />Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setSelected(s); setActionType("reject"); setRejectReason(""); }}>
                    <XCircle className="h-4 w-4" />Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={actionType === "reject" && !!selected} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Design — {selected?.designName}</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="mb-1.5 block">Rejection Reason *</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Image resolution too low (< 300 DPI). Please resubmit with higher resolution." rows={4} maxLength={500} />
            <p className="text-xs text-slate-400 mt-1">This will be sent to the vendor via email.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} loading={saving}>Send Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
