"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => categoryService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Category created");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create category");
    },
  });
};

export const useUpdateCategory = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => categoryService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Category updated");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete category");
    },
  });
};
