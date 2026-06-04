import { baseApi } from './baseApi';

export const affiliateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReferralOrders: builder.query<{ success: boolean; data: any[]; pagination?: any }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/affiliate/admin/referral-orders',
        params,
      }),
      providesTags: ['Affiliate'],
    }),
    updateReferralOrderStatus: builder.mutation<{ success: boolean; message: string; data: any }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/affiliate/admin/referral-orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Affiliate'],
    }),
    getAdminWithdrawals: builder.query<{ success: boolean; data: any[]; pagination?: any }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/affiliate/admin/withdrawals',
        params,
      }),
      providesTags: ['Affiliate'],
    }),
    updateWithdrawalStatus: builder.mutation<{ success: boolean; message: string; data: any }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/affiliate/admin/withdrawals/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Affiliate'],
    }),
  }),
});

export const {
  useGetAdminReferralOrdersQuery,
  useUpdateReferralOrderStatusMutation,
  useGetAdminWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation,
} = affiliateApi;
