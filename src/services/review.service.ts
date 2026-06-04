import { apiClient } from "@/lib/api-client";

export interface ApiReview {
  _id: string;
  user: { _id: string; name: string; img?: string } | string;
  product?: { _id: string; name: string } | string;
  description: string;
  rating: number;
  img?: string[];
  review_for: "WEBSITE" | "PRODUCT";
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewListResponse {
  message: string;
  data: ApiReview[];
}

export const reviewService = {
  getAll: async (): Promise<ReviewListResponse> => {
    const { data } = await apiClient.get<ReviewListResponse>("/review/get-all");
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiReview }> => {
    const { data } = await apiClient.post("/review/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/review/delete/${id}`);
    return data;
  },
};
