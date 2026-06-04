import { baseApi, type Pagination } from "./baseApi";

export interface CartItem {
  _id: string;
  user: string;
  product_id: string;
  product_name?: string;
  product_price?: number;
  color?: string;
  size?: string;
  quantity: number;
  price_after_discount?: number;
  discount_amount?: number;
  total_price?: number;
  total_discount_price?: number;
}

export interface CartListResponse {
  success: boolean;
  data: CartItem[];
  pagination: Pagination;
}

export interface CartResponse {
  success: boolean;
  message: string;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartListResponse, { page?: number } | void>({
      query: (params) => `cart/get-all?page=${params?.page ?? 1}`,
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<CartResponse, { product_id: string; quantity: number; color?: string; size?: string }>({
      query: (body) => ({ url: "cart/create", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),

    updateCart: builder.mutation<CartResponse, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({ url: `cart/update/${id}`, method: "PATCH", body: { quantity } }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation<CartResponse, string>({
      query: (id) => ({ url: `cart/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
} = cartApi;
