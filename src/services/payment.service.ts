import { apiClient } from "@/lib/api-client";

export interface ApiPayment {
  _id: string;
  purpose: string;
  session_id: string;
  transaction_id: string;
  status: boolean;
  user: { _id: string; name: string } | string;
  pay_by: string;
  amount: number;
  refund?: string;
  currency: string;
  createdAt?: string;
}

export const paymentService = {
  createSession: async (payload: {
    order_id: string;
    amount: number;
  }): Promise<{ message: string; data: { url: string } }> => {
    const { data } = await apiClient.post("/payment/create", payload);
    return data;
  },

  checkStatus: async (
    session_id: string
  ): Promise<{ message: string; data: ApiPayment }> => {
    const { data } = await apiClient.post("/payment/check-payment-status", { session_id });
    return data;
  },

  transferBalance: async (payload: {
    user_id: string;
    amount: number;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/payment/transfer-balance", payload);
    return data;
  },

  refund: async (payload: {
    payment_id: string;
    amount: number;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/payment/refund", payload);
    return data;
  },
};
