import { baseApi, type Pagination } from "./baseApi";

export interface Banner {
  _id: string;
  img: string;
  link: string;
  is_active: boolean;
  offer?: string;
  heading?: string;
  description?: string;
  button?: string;
  createdAt?: string;
}



export interface BannerListResponse {
  success: boolean;
  data: Banner[];
  pagination: Pagination;
}

export interface BannerResponse {
  success: boolean;
  message: string;
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<BannerListResponse, { page?: number } | void>({
      query: (params) => `banner/get-all?page=${params?.page ?? 1}`,
      providesTags: ["Banners"],
    }),

    createBanner: builder.mutation<BannerResponse, FormData>({
      query: (body) => ({ url: "banner/create", method: "POST", body }),
      invalidatesTags: ["Banners"],
    }),

    updateBanner: builder.mutation<BannerResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `banner/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Banners"],
    }),

    deleteBanner: builder.mutation<BannerResponse, string>({
      query: (id) => ({ url: `banner/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Banners"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
