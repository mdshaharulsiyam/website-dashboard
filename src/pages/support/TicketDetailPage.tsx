import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { mockSupportTickets } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials, BEE_LEVEL_COLORS } from "@/lib/utils";
import type { SupportTicket, SupportMessage } from "@/types";
import { toast } from "sonner";

const CANNED = [
  "Thank you for reaching out! We're looking into your issue.",
  "Your order has been confirmed and will be processed shortly.",
  "We sincerely apologize for the inconvenience caused.",
  "Please allow 3-5 business days for the refund to reflect.",
];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketData = mockSupportTickets.find((t) => t.id === id);

  const [ticket] = useState<SupportTicket | undefined>(ticketData);
  const [messages, setMessages] = useState<SupportMessage[]>(ticketData?.messages ?? []);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticketData?.status ?? "Open");
  const [sending, setSending] = useState(false);

  if (!ticket) return <Navigate to="/not-found" replace />;

  async function sendReply() {
    if (!reply.trim()) { toast.error("Message cannot be empty"); return; }
    if (reply.length > 2000) { toast.error("Message too long (max 2000 chars)"); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 400));
    setMessages((prev) => [...prev, {
      id: `msg-${Date.now()}`, ticketId: ticket!.id, senderId: "admin-1",
      senderName: "Support Team", senderType: "admin", content: reply,
      timestamp: new Date().toISOString(),
    }]);
    setSending(false);
    setReply("");
    toast.success("Reply sent");
  }

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title={`Ticket ${ticket.id}`}
        description={ticket.subject}
        actions={
          <Link to="/support">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Conversation ({messages.length} messages)</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-0">
              {messages.length === 0
                ? <p className="text-sm text-slate-400 py-4">No messages yet</p>
                : messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.senderType === "admin" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-slate-200">{getInitials(msg.senderName)}</AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] rounded-xl px-4 py-3 ${msg.senderType === "admin" ? "bg-amber-50 border border-amber-100" : "bg-slate-100"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{msg.senderName}</span>
                        <span className="text-xs text-slate-400">{formatDate(msg.timestamp, true)}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          {status !== "Resolved" && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Quick Replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {CANNED.map((c, i) => (
                      <button key={i} onClick={() => setReply(c)} className="text-xs bg-slate-100 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 transition-colors text-left">
                        {c.slice(0, 40)}…
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  rows={4}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{reply.length}/2000</span>
                  <Button onClick={sendReply} loading={sending} disabled={!reply.trim()}>
                    <Send className="h-4 w-4" />Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Ticket Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); toast.success(`Status updated to ${v}`); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-slate-400">Priority</p>
                <Badge variant={ticket.priority === "VIP" ? "default" : ticket.priority === "Urgent" ? "warning" : "secondary"} className="mt-1">{ticket.priority}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400">Assigned To</p>
                <p className="font-medium">{ticket.assignedTo ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-xs">{formatDate(ticket.createdAt, true)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(ticket.customerName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.customerName}</p>
                  <p className="text-xs text-slate-400">{ticket.customerEmail}</p>
                </div>
              </div>
              <Badge className={`text-xs ${BEE_LEVEL_COLORS[ticket.beeLevel]}`}>🐝 {ticket.beeLevel}</Badge>
              <Link to={`/customers/${ticket.customerId}`} className="block">
                <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
