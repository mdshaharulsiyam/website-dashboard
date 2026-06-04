import { baseApi } from "./baseApi";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
}

export interface FAQListResponse {
  success: boolean;
  data: FAQ[];
}

export interface FAQResponse {
  success: boolean;
  message: string;
  data: FAQ;
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFAQs: builder.query<FAQListResponse, void>({
      query: () => "faq/get-all",
      providesTags: ["FAQs"],
    }),

    createFAQ: builder.mutation<FAQResponse, { question: string; answer: string }>({
      query: (body) => ({ url: "faq/create", method: "POST", body }),
      invalidatesTags: ["FAQs"],
    }),

    updateFAQ: builder.mutation<FAQResponse, { id: string; question: string; answer: string }>({
      query: ({ id, ...body }) => ({ url: `faq/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["FAQs"],
    }),

    deleteFAQ: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `faq/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["FAQs"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} = faqApi;
