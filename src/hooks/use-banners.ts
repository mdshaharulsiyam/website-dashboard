"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/services/banner.service";
import { toast } from "sonner";

export const useBanners = () =>
  useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.getAll(),
  });

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => bannerService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Banner created");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create banner");
    },
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      bannerService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Banner updated");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update banner");
    },
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Banner deleted");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete banner");
    },
  });
};
