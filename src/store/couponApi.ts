import { baseApi, type Pagination } from "./baseApi";

export interface Coupon {
  _id: string;
  name: string;
  percentage: number;
  coupon_type: "all" | "product";
  max_discount: number;
  total_available: number;
  created_at?: string;
  updated_at?: string;
}

export interface CouponListResponse {
  success: boolean;
  data: Coupon[];
  pagination: Pagination;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data?: Coupon;
}

export interface CreateCouponPayload {
  name: string;
  percentage: number;
  coupon_type: "all" | "product";
  max_discount: number;
  total_available: number;
}

export interface CheckCouponResponse {
  success: boolean;
  message: string;
  data?: { discount: number; max_discount: number };
}

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<CouponListResponse, { page?: number } | void>({
      query: (params) => `coupon/get-all?page=${params?.page ?? 1}`,
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation<CouponResponse, CreateCouponPayload>({
      query: (body) => ({ url: "coupon/create", method: "POST", body }),
      invalidatesTags: ["Coupons"],
    }),

    updateCoupon: builder.mutation<CouponResponse, { id: string } & Partial<CreateCouponPayload>>({
      query: ({ id, ...body }) => ({ url: `coupon/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Coupons"],
    }),

    deleteCoupon: builder.mutation<CouponResponse, string>({
      query: (id) => ({ url: `coupon/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupons"],
    }),

    checkCoupon: builder.mutation<CheckCouponResponse, { code: string; product_id?: string[] }>({
      query: ({ code, ...body }) => ({ url: `coupon/check-coupon/${code}`, method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useCheckCouponMutation,
} = couponApi;
