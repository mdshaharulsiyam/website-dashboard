import { apiClient } from "@/lib/api-client";

export interface ApiService {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceListResponse {
  message: string;
  data: ApiService[];
}

export const serviceService = {
  getAll: async (): Promise<ServiceListResponse> => {
    const { data } = await apiClient.get<ServiceListResponse>("/service/get-all");
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiService }> => {
    const { data } = await apiClient.post("/service/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    payload: FormData
  ): Promise<{ message: string; data: ApiService }> => {
    const { data } = await apiClient.patch(`/service/update/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/service/delete/${id}`);
    return data;
  },
};
