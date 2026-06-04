import React, { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Package, Clock, Printer, CreditCard, MessageSquare, CheckCircle } from "lucide-react";
import { mockOrders } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";

const STATUS_FLOW: OrderStatus[] = ["Pending", "Confirmed", "Printing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrders.find((o) => o.id === id);

  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "Pending");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? "");
  const [courier, setCourier] = useState(order?.courier ?? "");
  const [internalNote, setInternalNote] = useState(order?.internalNotes ?? "");
  const [cancelDialog, setCancelDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!order) return <Navigate to="/not-found" replace />;

  const isTerminal = order.status === "Cancelled" || order.status === "Refunded" || order.status === "Delivered";

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (isTerminal) { toast.error("Cannot update a terminal order"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatus(newStatus);
    setSaving(false);
    toast.success(`Status updated to ${newStatus}`);
  }

  async function handleSaveNote() {
    if (!internalNote.trim()) { toast.error("Note cannot be empty"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("Internal note saved");
  }

  async function handleSaveTracking() {
    if (!trackingNumber.trim() || !courier.trim()) { toast.error("Fill in both tracking number and courier"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("Tracking information saved");
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <PageHeader
        title={`Order ${order.id}`}
        description={`Placed on ${formatDate(order.createdAt, true)}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/orders">
              <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => toast.info("Print invoice")}>
              <Printer className="h-4 w-4" />Invoice
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-500">Size: {item.size} · Color: {item.color} · Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.totalPrice)}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} each</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping</span><span>{formatCurrency(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1">
                  <span>Total</span><span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Order Timeline</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {order.timeline.length === 0 ? (
                <p className="text-sm text-slate-400">No timeline events yet</p>
              ) : (
                <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                  {order.timeline.map((event, i) => (
                    <li key={i} className="ml-5">
                      <div className="absolute -left-1.5 mt-0.5 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${ORDER_STATUS_COLORS[event.status]}`}>{event.status}</Badge>
                        {event.adminName && <span className="text-xs text-slate-400">by {event.adminName}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(event.timestamp, true)}</p>
                      {event.note && <p className="text-xs text-slate-600 mt-0.5 italic">{event.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Internal Notes (Admin Only)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add private notes about this order…"
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{internalNote.length}/1000</span>
                <Button size="sm" onClick={handleSaveNote} loading={saving}>Save Note</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Status</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Badge className={`text-sm px-3 py-1 ${ORDER_STATUS_COLORS[status]}`}>{status}</Badge>

              {!isTerminal && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">Update Status</p>
                    <Select value={status} onValueChange={(v) => handleStatusUpdate(v as OrderStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => setCancelDialog(true)}>
                      Cancel Order
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setRefundDialog(true)}>
                      Issue Refund
                    </Button>
                  </div>
                </>
              )}

              {isTerminal && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Order is {status.toLowerCase()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant={order.paymentStatus === "Paid" ? "success" : "destructive"}>{order.paymentStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Customer & Delivery</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1 text-sm">
              <p className="font-medium text-slate-900">{order.customerName}</p>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3 w-3" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p>{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                <p>{order.deliveryAddress.area}, {order.deliveryAddress.city}</p>
                <Badge variant="secondary" className="mt-1">{order.deliveryAddress.zone}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2.5">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Courier</label>
                <Input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Pathao, Steadfast, RedX…" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tracking Number</label>
                <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="TRK123456" />
              </div>
              <Button size="sm" className="w-full" onClick={handleSaveTracking} loading={saving}>
                Save Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialog}
        onOpenChange={setCancelDialog}
        title="Cancel this order?"
        description={`Order ${order.id} will be cancelled. This cannot be undone.`}
        confirmLabel="Cancel Order"
        variant="destructive"
        onConfirm={() => { setStatus("Cancelled"); setCancelDialog(false); toast.success("Order cancelled"); }}
      />

      <ConfirmDialog
        open={refundDialog}
        onOpenChange={setRefundDialog}
        title="Issue full refund?"
        description={`Refund of ${formatCurrency(order.total)} will be initiated for order ${order.id}.`}
        confirmLabel="Issue Refund"
        variant="default"
        onConfirm={() => { setStatus("Refunded"); setRefundDialog(false); toast.success("Refund initiated"); }}
      />
    </div>
  );
}
