"use client";
import { useQuery } from "@tanstack/react-query";
import { overviewService } from "@/services/overview.service";

export const useAdminOverview = () =>
  useQuery({
    queryKey: ["overview", "admin"],
    queryFn: () => overviewService.getAdminOverview(),
  });

export const usePublicStats = () =>
  useQuery({
    queryKey: ["overview", "public"],
    queryFn: () => overviewService.getPublicStats(),
  });
