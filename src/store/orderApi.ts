import { baseApi, type Pagination } from "./baseApi";

export interface OrderItem {
  _id: string;
  product: { _id: string; name: string; price: number; img: string[] };
  price: number;
  total_price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; img: string | null };
  items: OrderItem[];
  total_amount: number;
  discount: number;
  coupon_applied: boolean;
  coupon?: string;
  final_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: "cash_on_delivery" | "card" | "online";
  delivery_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  delivery_address: string;
  order_date: string;
  createdAt?: string;
}



export interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination?: Pagination;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface CreateOrderPayload {
  items: { product: string; quantity: number; size?: string; color?: string }[];
  delivery_address: string;
  payment_method: string;
  coupon?: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrderListResponse, { page?: number; delivery_status?: string; payment_status?: string } | void>({
      query: (params) => {
        const p = new URLSearchParams({ page: String(params?.page ?? 1) });
        if (params?.delivery_status) p.set("delivery_status", params.delivery_status);
        if (params?.payment_status) p.set("payment_status", params.payment_status);
        return `order/get-all?${p}`;
      },
      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation<OrderResponse, CreateOrderPayload>({
      query: (body) => ({ url: "order/create", method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),

    updateOrderStatus: builder.mutation<OrderResponse, { id: string; delivery_status?: string; payment_status?: string }>({
      query: ({ id, ...body }) => ({ url: `order/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Orders"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
