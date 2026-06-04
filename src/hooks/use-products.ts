"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, type ProductFilters } from "@/services/product.service";
import { toast } from "sonner";

export const useProducts = (filters?: ProductFilters) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getDetails(id),
    enabled: !!id,
  });

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete product");
    },
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => productService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create product");
    },
  });
};

export const useUpdateProduct = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => productService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Product updated");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update product");
    },
  });
};
