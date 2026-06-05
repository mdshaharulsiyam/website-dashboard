import { apiClient } from "@/lib/api-client";

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  price_after_discount: number;
  img: string[];
  category: { _id: string; name: string } | string;
  sub_category?: { _id: string; name: string } | string;
  stock: number;
  tag: string[];
  size?: string[];
  color?: string[];
  gender?: string;
  weight?: string;
  flag: string;
  total_sold?: number;
  coupon?: { available: boolean; coupon_code?: string };
  user?: { _id: string; name: string } | string;
  averageRating?: number;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  popular?: boolean;
  featured?: boolean;
  sub_category?: string;
  top_rated?: boolean;
  rating_min?: number;
  price_min?: number;
  price_max?: number;
  flag?: string;
}

export interface ProductListResponse {
  message: string;
  data: ApiProduct[];
  total?: number;
}

export const productService = {
  getAll: async (filters?: ProductFilters): Promise<ProductListResponse> => {
    const { data } = await apiClient.get<ProductListResponse>("/product/get-all", {
      params: filters,
    });
    return data;
  },

  getDetails: async (id: string): Promise<{ message: string; data: ApiProduct }> => {
    const { data } = await apiClient.get(`/product/get-details/${id}`);
    return data;
  },

  create: async (payload: FormData): Promise<{ message: string; data: ApiProduct }> => {
    const { data } = await apiClient.post("/product/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    payload: FormData
  ): Promise<{ message: string; data: ApiProduct }> => {
    const { data } = await apiClient.patch(`/product/update/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/product/delete/${id}`);
    return data;
  },
};
