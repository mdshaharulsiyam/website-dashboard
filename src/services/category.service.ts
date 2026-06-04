import { apiClient } from "@/lib/api-client";

export interface ApiCategory {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  message: string;
  data: ApiCategory[];
}

export const categoryService = {
  getAll: async (): Promise<CategoryListResponse> => {
    const { data } = await apiClient.get<CategoryListResponse>("/category/get-all");
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiCategory }> => {
    const { data } = await apiClient.post("/category/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    payload: FormData
  ): Promise<{ message: string; data: ApiCategory }> => {
    const { data } = await apiClient.patch(`/category/update/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/category/delete/${id}`);
    return data;
  },
};
