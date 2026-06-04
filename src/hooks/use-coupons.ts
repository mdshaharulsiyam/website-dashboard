"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService, type ApiCoupon } from "@/services/coupon.service";
import { toast } from "sonner";

export const useCoupons = () =>
  useQuery({
    queryKey: ["coupons"],
    queryFn: () => couponService.getAll(),
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      percentage: number;
      total_available: number;
      max_discount?: number;
      coupon_type: "product" | "all";
    }) => couponService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Coupon created");
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create coupon");
    },
  });
};

export const useUpdateCoupon = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ApiCoupon>) => couponService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Coupon updated");
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update coupon");
    },
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Coupon deleted");
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete coupon");
    },
  });
};
