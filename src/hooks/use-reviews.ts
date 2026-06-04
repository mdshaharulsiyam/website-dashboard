"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/review.service";
import { toast } from "sonner";

export const useReviews = () =>
  useQuery({
    queryKey: ["reviews"],
    queryFn: () => reviewService.getAll(),
  });

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Review deleted");
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete review");
    },
  });
};
