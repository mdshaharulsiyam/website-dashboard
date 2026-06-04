"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService, type ContentSetting } from "@/services/settings.service";
import { toast } from "sonner";

export const useWebSettings = () =>
  useQuery({
    queryKey: ["settings", "web"],
    queryFn: () => settingsService.getWebSettings(),
  });

export const useUpdateWebSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => settingsService.updateWebSettings(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Settings updated");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update settings");
    },
  });
};

export const useContentSettings = () =>
  useQuery({
    queryKey: ["settings", "content"],
    queryFn: () => settingsService.getContentSettings(),
  });

export const useUpdateContentSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContentSetting[]) =>
      Promise.all(payload.map((setting) => settingsService.updateSetting(setting))),
    onSuccess: () => {
      toast.success("Page settings updated");
      qc.invalidateQueries({ queryKey: ["settings", "content"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update page settings");
    },
  });
};
