"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationService,
  type CreateCampaignPayload,
  type SendUserNotificationPayload,
  type UpdateTemplatePayload,
} from "@/services/notification.service";

export const useNotificationCampaigns = () =>
  useQuery({
    queryKey: ["notifications", "campaigns"],
    queryFn: () => notificationService.getCampaigns(),
  });

export const useNotificationTemplates = () =>
  useQuery({
    queryKey: ["notifications", "templates"],
    queryFn: () => notificationService.getTemplates(),
  });

export const useUserNotifications = () =>
  useQuery({
    queryKey: ["notifications", "user"],
    queryFn: () => notificationService.getUserNotifications(),
    refetchInterval: 60_000,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60_000,
  });

export const useCreateNotificationCampaign = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => notificationService.createCampaign(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Campaign saved");
      qc.invalidateQueries({ queryKey: ["notifications", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to save campaign");
    },
  });
};

export const useSendUserNotification = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendUserNotificationPayload) => notificationService.sendUserNotification(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Notification sent");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to send notification");
    },
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useUpdateNotificationTemplate = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTemplatePayload) => notificationService.updateTemplate(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Template updated");
      qc.invalidateQueries({ queryKey: ["notifications", "templates"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update template");
    },
  });
};

export const useToggleNotificationTemplate = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.toggleTemplate(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Template status updated");
      qc.invalidateQueries({ queryKey: ["notifications", "templates"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update template status");
    },
  });
};
