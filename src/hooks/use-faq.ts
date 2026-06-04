"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqService, type SaveFaqPayload } from "@/services/faq.service";
import { toast } from "sonner";

export const useFaqs = () =>
  useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqService.getAll(),
  });

export const useCreateFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveFaqPayload) => faqService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "FAQ created");
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create FAQ");
    },
  });
};

export const useUpdateFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveFaqPayload }) =>
      faqService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "FAQ updated");
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update FAQ");
    },
  });
};

export const useDeleteFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "FAQ deleted");
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete FAQ");
    },
  });
};
