import { baseApi } from "./baseApi";

export interface OverviewResponse {
  user: number;
  professionals: number;
  total_earning: number;
  earningGrowth: {
    data: number[];
    monthNames: string[];
  };
  userGrowth: {
    data: number[];
    monthNames: string[];
  };
  users_year: number[];
  payment_year: number[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<OverviewResponse, { year_user?: number; year_payment?: number } | void>({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.year_user) p.set("year_user", String(params.year_user));
        if (params?.year_payment) p.set("year_payment", String(params.year_payment));
        return `dashboard/get-overview?${p}`;
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetOverviewQuery } = dashboardApi;
