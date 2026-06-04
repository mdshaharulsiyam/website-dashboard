import { apiClient } from "@/lib/api-client";

export const NOTIFICATION_SEGMENTS = ["all", "Larva", "Worker", "Drone", "Queen", "Royal", "new", "returning"] as const;

export type NotificationSegment = (typeof NOTIFICATION_SEGMENTS)[number];
export type NotificationType = "email" | "sms" | "push";
export type NotificationCampaignStatus = "draft" | "sent" | "scheduled";
export type NotificationTemplateType = "email" | "sms";

export interface NotificationCampaign {
  _id: string;
  title: string;
  body: string;
  type: NotificationType;
  segment: NotificationSegment;
  status: NotificationCampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openRate?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { _id: string; name: string; email?: string } | string;
}

export interface UserNotification {
  _id: string;
  user?: { _id: string; name: string; img?: string | null } | string;
  campaign?: string;
  title: string;
  message: string;
  type?: NotificationType;
  read_by_admin: boolean;
  read_by_user: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  trigger: string;
  type: NotificationTemplateType;
  subject?: string;
  body: string;
  isActive: boolean;
  lastModified?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampaignPayload {
  title: string;
  body: string;
  type: NotificationType;
  segment: NotificationSegment;
  scheduledAt?: string;
}

export interface SendUserNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface UpdateTemplatePayload {
  id: string;
  subject?: string;
  body: string;
  isActive?: boolean;
}

export const notificationService = {
  getCampaigns: async (): Promise<{ success: boolean; message: string; data: NotificationCampaign[] }> => {
    const { data } = await apiClient.get("/notification/campaigns");
    return data;
  },

  createCampaign: async (
    payload: CreateCampaignPayload
  ): Promise<{ success: boolean; message: string; data: NotificationCampaign }> => {
    const { data } = await apiClient.post("/notification/campaigns", payload);
    return data;
  },

  sendUserNotification: async (
    payload: SendUserNotificationPayload
  ): Promise<{ success: boolean; message: string; data: UserNotification }> => {
    const { userId, ...body } = payload;
    const { data } = await apiClient.post(`/notification/users/${userId}`, body);
    return data;
  },

  getUserNotifications: async (): Promise<{ success: boolean; data: UserNotification[] }> => {
    const { data } = await apiClient.get("/notification/get-all", {
      params: { sort: "createdAt", order: "desc", limit: 20, page: 1 },
    });
    return data;
  },

  getUnreadCount: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const { data } = await apiClient.get("/notification/unread-count");
    return data;
  },

  markRead: async (id: string): Promise<{ success: boolean; message: string; data: UserNotification }> => {
    const { data } = await apiClient.patch(`/notification/read/${id}`);
    return data;
  },

  markAllRead: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.patch("/notification/read-all");
    return data;
  },

  getTemplates: async (): Promise<{ success: boolean; message: string; data: NotificationTemplate[] }> => {
    const { data } = await apiClient.get("/notification/templates");
    return data;
  },

  updateTemplate: async (
    payload: UpdateTemplatePayload
  ): Promise<{ success: boolean; message: string; data: NotificationTemplate }> => {
    const { id, ...body } = payload;
    const { data } = await apiClient.patch(`/notification/templates/${id}`, body);
    return data;
  },

  toggleTemplate: async (
    id: string
  ): Promise<{ success: boolean; message: string; data: NotificationTemplate }> => {
    const { data } = await apiClient.patch(`/notification/templates/${id}/toggle`);
    return data;
  },
};
