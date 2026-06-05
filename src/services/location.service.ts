import { apiClient } from "@/lib/api-client";

export interface ApiDivision {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiState {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCity {
  _id: string;
  name: string;
  state: ApiState | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DivisionListResponse {
  message: string;
  data: ApiDivision[];
}

export interface StateListResponse {
  message: string;
  data: ApiState[];
}

export interface CityListResponse {
  message: string;
  data: ApiCity[];
}

export type SaveDivisionPayload = { name: string };
export type SaveStatePayload = { name: string };
export type SaveCityPayload = { name: string; state: string };

export const divisionService = {
  getAll: async (): Promise<DivisionListResponse> => {
    const { data } = await apiClient.get<DivisionListResponse>("/division/get-all");
    return data;
  },

  create: async (payload: SaveDivisionPayload): Promise<{ message: string; data: ApiDivision }> => {
    const { data } = await apiClient.post("/division/create", payload);
    return data;
  },

  update: async (id: string, payload: SaveDivisionPayload): Promise<{ message: string; data: ApiDivision }> => {
    const { data } = await apiClient.patch(`/division/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/division/delete/${id}`);
    return data;
  },
};

export const stateService = {
  getAll: async (): Promise<StateListResponse> => {
    const { data } = await apiClient.get<StateListResponse>("/state/get-all");
    return data;
  },

  create: async (payload: SaveStatePayload): Promise<{ message: string; data: ApiState }> => {
    const { data } = await apiClient.post("/state/create", payload);
    return data;
  },

  update: async (id: string, payload: SaveStatePayload): Promise<{ message: string; data: ApiState }> => {
    const { data } = await apiClient.patch(`/state/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/state/delete/${id}`);
    return data;
  },
};

export const cityService = {
  getAll: async (): Promise<CityListResponse> => {
    const { data } = await apiClient.get<CityListResponse>("/city/get-all");
    return data;
  },

  create: async (payload: SaveCityPayload): Promise<{ message: string; data: ApiCity }> => {
    const { data } = await apiClient.post("/city/create", payload);
    return data;
  },

  update: async (id: string, payload: SaveCityPayload): Promise<{ message: string; data: ApiCity }> => {
    const { data } = await apiClient.patch(`/city/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/city/delete/${id}`);
    return data;
  },
};
