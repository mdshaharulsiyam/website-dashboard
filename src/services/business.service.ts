import { apiClient } from "@/lib/api-client";

export type BusinessCategory =
  | "salon"
  | "restaurant"
  | "medical"
  | "fitness"
  | "shop"
  | "real_estate"
  | "services"
  | "other";

export interface ApiBusiness {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  name: string;
  logo?: string | null;
  banner: string;
  address: string;
  location: { type: "Point"; coordinates: [number, number] };
  trade_license?: string | null;
  business_category: BusinessCategory;
  block: boolean;
  is_approve: boolean;
  business_documents?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessListResponse {
  message: string;
  data: ApiBusiness[];
}

export const businessService = {
  getAll: async (): Promise<BusinessListResponse> => {
    const { data } = await apiClient.get<BusinessListResponse>("/business/get-all");
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiBusiness }> => {
    const { data } = await apiClient.post("/business/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    payload: FormData
  ): Promise<{ message: string; data: ApiBusiness }> => {
    const { data } = await apiClient.patch(`/business/update/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  approve: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch(`/business/approve/${id}`);
    return data;
  },

  block: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch(`/business/block/${id}`);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/business/delete/${id}`);
    return data;
  },
};
