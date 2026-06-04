import { apiClient } from "@/lib/api-client";

export interface ApiCoupon {
  _id: string;
  name: string;
  percentage: number;
  total_available: number;
  max_discount?: number;
  coupon_type: "product" | "all";
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponListResponse {
  message: string;
  data: ApiCoupon[];
}

export const couponService = {
  getAll: async (): Promise<CouponListResponse> => {
    const { data } = await apiClient.get<CouponListResponse>("/coupon/get-all");
    return data;
  },

  checkCoupon: async (
    name: string,
    productId: string
  ): Promise<{ message: string; data: ApiCoupon }> => {
    const { data } = await apiClient.get(`/coupon/check-coupon/${name}/${productId}`);
    return data;
  },

  create: async (payload: {
    name: string;
    percentage: number;
    total_available: number;
    max_discount?: number;
    coupon_type: "product" | "all";
  }): Promise<{ message: string; data: ApiCoupon }> => {
    const { data } = await apiClient.post("/coupon/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<ApiCoupon>
  ): Promise<{ message: string; data: ApiCoupon }> => {
    const { data } = await apiClient.patch(`/coupon/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/coupon/delete/${id}`);
    return data;
  },
};
