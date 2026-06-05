"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  divisionService,
  stateService,
  cityService,
  type SaveDivisionPayload,
  type SaveStatePayload,
  type SaveCityPayload,
} from "@/services/location.service";
import { toast } from "sonner";

// ─── Division hooks ────────────────────────────────────────────────────────────

export const useDivisions = () =>
  useQuery({
    queryKey: ["divisions"],
    queryFn: () => divisionService.getAll(),
  });

export const useCreateDivision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDivisionPayload) => divisionService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Division created");
      qc.invalidateQueries({ queryKey: ["divisions"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create division");
    },
  });
};

export const useUpdateDivision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveDivisionPayload }) =>
      divisionService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "Division updated");
      qc.invalidateQueries({ queryKey: ["divisions"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update division");
    },
  });
};

export const useDeleteDivision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => divisionService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "Division deleted");
      qc.invalidateQueries({ queryKey: ["divisions"] });
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete division");
    },
  });
};

// ─── State hooks ───────────────────────────────────────────────────────────────

export const useStates = () =>
  useQuery({
    queryKey: ["states"],
    queryFn: () => stateService.getAll(),
  });

export const useCreateState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveStatePayload) => stateService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "State created");
      qc.invalidateQueries({ queryKey: ["states"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create state");
    },
  });
};

export const useUpdateState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveStatePayload }) =>
      stateService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "State updated");
      qc.invalidateQueries({ queryKey: ["states"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update state");
    },
  });
};

export const useDeleteState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stateService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "State deleted");
      qc.invalidateQueries({ queryKey: ["states"] });
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete state");
    },
  });
};

// ─── City hooks ────────────────────────────────────────────────────────────────

export const useCities = () =>
  useQuery({
    queryKey: ["cities"],
    queryFn: () => cityService.getAll(),
  });

export const useCreateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveCityPayload) => cityService.create(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "City created");
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to create city");
    },
  });
};

export const useUpdateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveCityPayload }) =>
      cityService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "City updated");
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to update city");
    },
  });
};

export const useDeleteCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cityService.delete(id),
    onSuccess: (res) => {
      toast.success(res.message ?? "City deleted");
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Failed to delete city");
    },
  });
};
