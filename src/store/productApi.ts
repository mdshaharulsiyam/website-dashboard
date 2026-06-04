import { baseApi, type Pagination } from "./baseApi";

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stock?: number;
  flag?: string;
  banner?: string;
  img?: string | string[];
  category?: string | { _id: string; name: string };
  sub_category?: string | { _id: string; name: string };
  category_name?: string;
  sub_category_name?: string;
  category_id?: string;
  sub_category_id?: string;
  size?: string[];
  color?: string[];
  tag?: string[];
  gender?: string;
  coupon?: { available: boolean; coupon_code: string };
  averageRating?: number | null;
  totalReviews?: number;
  price_after_discount?: number;
  is_deleted?: boolean;
  createdAt?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation<ProductResponse, FormData>({
      query: (body) => ({ url: "product/create", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    getProducts: builder.query<ProductListResponse, { page?: number; limit?: number; flag?: string } | void>({
      query: (params) => {
        const p = new URLSearchParams({ page: String(params?.page ?? 1), limit: String(params?.limit ?? 20) });
        if (params?.flag) p.set("flag", params.flag);
        return `product/get-all?${p}`;
      },
      providesTags: ["Products"],
    }),

    getProduct: builder.query<ProductResponse, string>({
      query: (id) => `product/get-details/${id}`,
      providesTags: ["Products"],
    }),

    updateProduct: builder.mutation<ProductResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `product/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `product/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
