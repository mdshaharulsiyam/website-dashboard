import { baseApi, type Pagination } from "./baseApi";

export interface ServiceSummary {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  img: string;
  is_active: boolean;
  services?: ServiceSummary[];
  total_service?: number;
  total_product?: number;
  createdAt?: string;
}

export interface Service {
  _id: string;
  name: string;
  img: string;
  category?: string;
  is_active?: boolean;
  createdAt?: string;
}



export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  pagination: Pagination;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface ServiceListResponse {
  success: boolean;
  data: Service[];
  pagination: Pagination;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryListResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const p = new URLSearchParams({ page: String(params?.page ?? 1), limit: String(params?.limit ?? 100) });
        return `category/get-all?${p}`;
      },
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<CategoryResponse, FormData>({
      query: (body) => ({ url: "category/create", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<CategoryResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `category/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `category/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),

    getServices: builder.query<ServiceListResponse, { page?: number; category_id?: string } | void>({
      query: (params) => {
        const p = new URLSearchParams({ page: String(params?.page ?? 1) });
        if (params?.category_id) p.set("category_id", params.category_id);
        return `service/get-all?${p}`;
      },
      providesTags: ["Services"],
    }),

    createService: builder.mutation<{ success: boolean; message: string; data: Service }, FormData>({
      query: (body) => ({ url: "service/create", method: "POST", body }),
      invalidatesTags: ["Services", "Categories"],
    }),

    updateService: builder.mutation<{ success: boolean; message: string; data: Service }, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `service/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Services", "Categories"],
    }),

    deleteService: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `service/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Services", "Categories"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = categoryApi;
