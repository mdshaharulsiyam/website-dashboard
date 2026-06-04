import { apiClient } from "@/lib/api-client";

export type OrderDeliveryStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "canceled"
  | "returned";

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderPaymentMethod = "credit_card" | "paypal" | "bank_transfer" | "cash_on_delivery";

export interface ApiOrderItem {
  product: { _id: string; name: string; img: string[] } | string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  total_price: number;
}

export interface ApiOrder {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string } | string;
  items: ApiOrderItem[];
  total_amount: number;
  discount: number;
  final_amount: number;
  coupon?: string;
  coupon_applied: boolean;
  payment_status?: OrderPaymentStatus;
  payment_method?: OrderPaymentMethod;
  delivery_status?: OrderDeliveryStatus;
  delivery_address: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  order_date?: string;
  canceled_at?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderListResponse {
  message: string;
  data: ApiOrder[];
  total?: number;
}

export const orderService = {
  getAll: async (search?: string): Promise<OrderListResponse> => {
    const { data } = await apiClient.get<OrderListResponse>("/order/get-all", {
      params: search ? { search } : undefined,
    });
    return data;
  },

  getDetails: async (id: string): Promise<{ message: string; data: ApiOrder }> => {
    const { data } = await apiClient.get(`/order/details/${id}`);
    return data;
  },

  updateDeliveryStatus: async (
    id: string,
    delivery_status: OrderDeliveryStatus
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.patch(`/order/update-delivery-status/${id}`, {
      delivery_status,
    });
    return data;
  },

  update: async (
    id: string,
    payload: Partial<ApiOrder>
  ): Promise<{ message: string; data: ApiOrder }> => {
    const { data } = await apiClient.patch(`/order/update/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/order/delete/${id}`);
    return data;
  },
};
