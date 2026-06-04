import { apiClient } from "@/lib/api-client";

export interface ApiBanner {
  _id: string;
  img: string;
  link: string;
  offer: string;
  heading: string;
  description: string;
  button: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerListResponse {
  message: string;
  data: ApiBanner[];
}

export const bannerService = {
  getAll: async (): Promise<BannerListResponse> => {
    const { data } = await apiClient.get<BannerListResponse>("/banner/get-all");
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiBanner }> => {
    const { data } = await apiClient.post("/banner/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    payload: FormData
  ): Promise<{ message: string; data: ApiBanner }> => {
    const { data } = await apiClient.patch(`/banner/update/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/banner/delete/${id}`);
    return data;
  },
};
