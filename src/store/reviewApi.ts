import { baseApi, type Pagination } from "./baseApi";

export interface Review {
  _id: string;
  user: { _id: string; name: string; img: string | null };
  description: string;
  rating: number;
  product?: string | null;
  img?: string[];
  review_for: "PRODUCT" | "WEBSITE";
  createdAt?: string;
}



export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  pagination?: Pagination;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: Review;
}

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewListResponse, { page?: number; review_for?: "PRODUCT" | "WEBSITE"; sort?: string; order?: "asc" | "desc" } | void>({
      query: (params) => {
        const p = new URLSearchParams({ page: String(params?.page ?? 1) });
        if (params?.review_for) p.set("review_for", params.review_for);
        if (params?.sort) p.set("sort", params.sort);
        if (params?.order) p.set("order", params.order);
        return `review/get-all?${p}`;
      },
      providesTags: ["Reviews"],
    }),

    createReview: builder.mutation<ReviewResponse, FormData>({
      query: (body) => ({ url: "review/create", method: "POST", body }),
      invalidatesTags: ["Reviews"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewApi;
