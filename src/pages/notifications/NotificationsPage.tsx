import React, { useMemo, useState } from "react";
import { Bell, Loader2, Mail, MessageCircle, Send } from "lucide-react";
import {
  useCreateNotificationCampaign,
  useNotificationCampaigns,
  useNotificationTemplates,
  useSendUserNotification,
  useToggleNotificationTemplate,
  useUpdateNotificationTemplate,
} from "@/hooks/use-notifications";
import { useCustomers } from "@/hooks/use-customers";
import { mapApiCustomerToCustomer } from "@/services/customer.service";
import {
  NOTIFICATION_SEGMENTS,
  type NotificationCampaign,
  type NotificationSegment,
  type NotificationTemplate,
  type NotificationType,
} from "@/services/notification.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_BROADCAST = {
  title: "",
  body: "",
  type: "email" as NotificationType,
  segment: "all" as NotificationSegment,
  audience: "segment" as "segment" | "user",
  userId: "",
  scheduledAt: "",
};

function campaignIcon(type: NotificationCampaign["type"]) {
  if (type === "email") return <Mail className="h-4 w-4 text-blue-600" />;
  if (type === "sms") return <MessageCircle className="h-4 w-4 text-green-600" />;
  return <Bell className="h-4 w-4 text-purple-600" />;
}

function campaignIconBg(type: NotificationCampaign["type"]) {
  if (type === "email") return "bg-blue-100";
  if (type === "sms") return "bg-green-100";
  return "bg-purple-100";
}

export default function NotificationsPage() {
  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    isError: campaignsError,
    refetch: refetchCampaigns,
  } = useNotificationCampaigns();
  const {
    data: templatesData,
    isLoading: templatesLoading,
    isError: templatesError,
    refetch: refetchTemplates,
  } = useNotificationTemplates();
  const createCampaign = useCreateNotificationCampaign();
  const sendUserNotification = useSendUserNotification();
  const updateTemplate = useUpdateNotificationTemplate();
  const toggleTemplate = useToggleNotificationTemplate();
  const { data: customersData } = useCustomers();

  const [broadcastDialog, setBroadcastDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(null);
  const [broadcast, setBroadcast] = useState(EMPTY_BROADCAST);

  const campaigns = campaignsData?.data ?? [];
  const templates = templatesData?.data ?? [];
  const customers = useMemo(
    () => (customersData?.data ?? []).map(mapApiCustomerToCustomer),
    [customersData?.data],
  );

  const emailTemplates = useMemo(
    () => templates.filter((template) => template.type === "email"),
    [templates],
  );
  const smsTemplates = useMemo(
    () => templates.filter((template) => template.type === "sms"),
    [templates],
  );

  function validateBroadcast() {
    if (!broadcast.title.trim()) {
      toast.error("Title required");
      return false;
    }
    if (!broadcast.body.trim()) {
      toast.error("Message body required");
      return false;
    }
    if (broadcast.body.length > 500) {
      toast.error("Body too long (max 500 chars)");
      return false;
    }
    if (broadcast.audience === "user" && !broadcast.userId) {
      toast.error("Select a customer");
      return false;
    }
    return true;
  }

  async function sendBroadcast() {
    if (!validateBroadcast()) return;

    if (broadcast.audience === "user") {
      await sendUserNotification.mutateAsync({
        userId: broadcast.userId,
        title: broadcast.title,
        message: broadcast.body,
        type: broadcast.type,
      });
    } else {
      await createCampaign.mutateAsync({
        title: broadcast.title,
        body: broadcast.body,
        type: broadcast.type,
        segment: broadcast.segment,
        scheduledAt: broadcast.scheduledAt || undefined,
      });
    }

    setBroadcast(EMPTY_BROADCAST);
    setBroadcastDialog(false);
  }

  async function saveTemplate() {
    if (!editTemplate) return;
    if (editTemplate.type === "email" && !editTemplate.subject?.trim()) {
      toast.error("Subject required");
      return;
    }
    if (!editTemplate.body.trim()) {
      toast.error("Body required");
      return;
    }

    await updateTemplate.mutateAsync({
      id: editTemplate._id,
      subject: editTemplate.subject ?? "",
      body: editTemplate.body,
      isActive: editTemplate.isActive,
    });
    setEditTemplate(null);
  }

  if (campaignsLoading || templatesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (campaignsError || templatesError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
        <p className="text-sm font-medium text-red-500">Unable to load notifications.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetchCampaigns();
            void refetchTemplates();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications & Communications"
        description="Email/SMS templates and broadcast campaigns"
        actions={
          <Button size="sm" onClick={() => setBroadcastDialog(true)}>
            <Send className="h-4 w-4" />
            New Broadcast
          </Button>
        }
      />

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">
            <Bell className="h-4 w-4 mr-1.5" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-1.5" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageCircle className="h-4 w-4 mr-1.5" />
            SMS Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No campaigns sent yet</p>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardContent className="flex items-center gap-4 py-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${campaignIconBg(campaign.type)}`}>
                    {campaignIcon(campaign.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{campaign.title}</p>
                    <p className="text-xs text-slate-500 truncate">{campaign.body}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {campaign.segment === "all" ? "All Users" : campaign.segment}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatNumber(campaign.recipientCount)} recipients
                      </span>
                      {campaign.openRate ? (
                        <span className="text-xs text-emerald-600">
                          {Math.round(campaign.openRate * 100)}% open rate
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant={campaign.status === "sent" ? "success" : campaign.status === "scheduled" ? "warning" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {campaign.status}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">
                      {campaign.sentAt
                        ? formatDate(campaign.sentAt)
                        : campaign.scheduledAt
                        ? formatDate(campaign.scheduledAt)
                        : "Draft"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="email" className="space-y-3">
          {emailTemplates.map((template) => (
            <Card key={template._id}>
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-slate-400">
                    Trigger: <code className="bg-slate-100 px-1 rounded">{template.trigger}</code>
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{template.subject}</p>
                </div>
                <Switch
                  checked={template.isActive}
                  disabled={toggleTemplate.isPending}
                  onCheckedChange={() => toggleTemplate.mutate(template._id)}
                />
                <Button variant="outline" size="sm" onClick={() => setEditTemplate(template)}>
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sms" className="space-y-3">
          {smsTemplates.map((template) => (
            <Card key={template._id}>
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-slate-400">
                    Trigger: <code className="bg-slate-100 px-1 rounded">{template.trigger}</code>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{template.body}</p>
                </div>
                <Switch
                  checked={template.isActive}
                  disabled={toggleTemplate.isPending}
                  onCheckedChange={() => toggleTemplate.mutate(template._id)}
                />
                <Button variant="outline" size="sm" onClick={() => setEditTemplate(template)}>
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={broadcastDialog} onOpenChange={setBroadcastDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Type</Label>
                <Select value={broadcast.type} onValueChange={(value) => setBroadcast((prev) => ({ ...prev, type: value as NotificationType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Audience</Label>
                <Select
                  value={broadcast.audience}
                  onValueChange={(value) =>
                    setBroadcast((prev) => ({ ...prev, audience: value as "segment" | "user" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segment">Customer Segment</SelectItem>
                    <SelectItem value="user">Single Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {broadcast.audience === "segment" ? (
              <div>
                <Label className="mb-1 block">Segment</Label>
                <Select
                  value={broadcast.segment}
                  onValueChange={(value) => setBroadcast((prev) => ({ ...prev, segment: value as NotificationSegment }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_SEGMENTS.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment === "all" ? "All Users" : segment === "new" ? "New Users" : segment === "returning" ? "Returning Users" : segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label className="mb-1 block">Customer</Label>
                <Select
                  value={broadcast.userId}
                  onValueChange={(value) => setBroadcast((prev) => ({ ...prev, userId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="mb-1 block">Title *</Label>
              <Input
                value={broadcast.title}
                onChange={(event) => setBroadcast((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Campaign title"
              />
            </div>
            <div>
              <Label className="mb-1 block">
                Message Body * <span className="text-slate-400 text-xs">(max 500 chars)</span>
              </Label>
              <Textarea
                value={broadcast.body}
                onChange={(event) => setBroadcast((prev) => ({ ...prev, body: event.target.value }))}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1">{broadcast.body.length}/500</p>
            </div>
            {broadcast.audience === "segment" && (
              <div>
                <Label className="mb-1 block">Schedule (leave blank to send now)</Label>
                <Input
                  type="datetime-local"
                  value={broadcast.scheduledAt}
                  onChange={(event) => setBroadcast((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void sendBroadcast()}
              loading={createCampaign.isPending || sendUserNotification.isPending}
            >
              {broadcast.audience === "user" ? "Send To Customer" : broadcast.scheduledAt ? "Schedule" : "Send Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTemplate} onOpenChange={(open) => !open && setEditTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {editTemplate?.type?.toUpperCase()} Template - {editTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {editTemplate && (
            <div className="space-y-3">
              {editTemplate.type === "email" && (
                <div>
                  <Label className="mb-1 block">Subject *</Label>
                  <Input
                    value={editTemplate.subject ?? ""}
                    onChange={(event) =>
                      setEditTemplate((prev) => (prev ? { ...prev, subject: event.target.value } : prev))
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Use {"{{customerName}}"}, {"{{orderId}}"}, {"{{total}}"} as variables
                  </p>
                </div>
              )}
              <div>
                <Label className="mb-1 block">Body *</Label>
                <Textarea
                  value={editTemplate.body}
                  onChange={(event) =>
                    setEditTemplate((prev) => (prev ? { ...prev, body: event.target.value } : prev))
                  }
                  rows={10}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={() => void saveTemplate()} loading={updateTemplate.isPending}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
