"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessService } from "@/services/business.service";
import { toast } from "sonner";

export const useBusinesses = () =>
  useQuery({
    queryKey: ["businesses"],
    queryFn: () => businessService.getAll(),
  });

export const useApproveBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.approve(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Business approved");
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to approve business");
    },
  });
};

export const useBlockBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.block(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Business blocked");
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to block business");
    },
  });
};

export const useDeleteBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Business deleted");
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete business");
    },
  });
};
