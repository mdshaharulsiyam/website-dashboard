"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, type OrderDeliveryStatus } from "@/services/order.service";
import { toast } from "sonner";

export const useOrders = (search?: string) =>
  useQuery({
    queryKey: ["orders", search],
    queryFn: () => orderService.getAll(search),
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderService.getDetails(id),
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderDeliveryStatus }) =>
      orderService.updateDeliveryStatus(id, status),
    onSuccess: (res) => {
      toast.success(res.message ?? "Order status updated");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update status");
    },
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Order deleted");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete order");
    },
  });
};
