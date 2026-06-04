import { apiClient } from "@/lib/api-client";

export interface ApiFaq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqListResponse {
  message: string;
  data: ApiFaq[];
}

export type SaveFaqPayload = {
  question: string;
  answer: string;
  category?: string;
};

export const faqService = {
  getAll: async (): Promise<FaqListResponse> => {
    const { data } = await apiClient.get<FaqListResponse>("/faq/get-all");
    return data;
  },

  create: async (payload: SaveFaqPayload): Promise<{ message: string; data: ApiFaq }> => {
    const { data } = await apiClient.post("/faq/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: SaveFaqPayload
  ): Promise<{ message: string; data: ApiFaq }> => {
    const { data } = await apiClient.patch(`/faq/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/faq/delete/${id}`);
    return data;
  },
};
