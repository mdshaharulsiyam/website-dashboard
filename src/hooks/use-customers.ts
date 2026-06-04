"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerService, type CustomerFilters } from "@/services/customer.service";

export const useCustomers = (filters?: CustomerFilters) =>
  useQuery({
    queryKey: ["customers", filters],
    queryFn: () => customerService.getAll(filters),
  });

export const useToggleCustomerBlock = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.toggleBlock(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Customer status updated");
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update customer status");
    },
  });
};
