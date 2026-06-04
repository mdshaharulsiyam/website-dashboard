import { baseApi, type Pagination } from "./baseApi";

export interface Division {
  _id: string;
  name: string;
  createdAt?: string;
}

export interface District {
  _id: string;
  name: string;
  division?: string;
  division_name?: string;
  division_id?: string;
  createdAt?: string;
}



export interface DivisionListResponse {
  success: boolean;
  data: Division[];
  pagination: Pagination;
}

export interface DivisionResponse {
  success: boolean;
  message: string;
  data: Division;
}

export interface DistrictListResponse {
  success: boolean;
  data: District[];
  pagination: Pagination;
}

export interface DistrictResponse {
  success: boolean;
  message: string;
  data: District;
}

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDivisions: builder.query<DivisionListResponse, void>({
      query: () => "divisions/get-all",
      providesTags: ["Divisions"],
    }),

    createDivision: builder.mutation<DivisionResponse, { name: string }>({
      query: (body) => ({ url: "division/create", method: "POST", body }),
      invalidatesTags: ["Divisions"],
    }),

    updateDivision: builder.mutation<DivisionResponse, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `division/update/${id}`, method: "PATCH", body: { name } }),
      invalidatesTags: ["Divisions"],
    }),

    deleteDivision: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `division/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Divisions"],
    }),

    getDistricts: builder.query<DistrictListResponse, { division_id?: string } | void>({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.division_id) p.set("division_id", params.division_id);
        return `districts/get-all?${p}`;
      },
      providesTags: ["Districts"],
    }),

    createDistrict: builder.mutation<DistrictResponse, { name: string; division: string }>({
      query: (body) => ({ url: "city/create", method: "POST", body }),
      invalidatesTags: ["Districts"],
    }),

    updateDistrict: builder.mutation<DistrictResponse, { id: string; name: string; division: string }>({
      query: ({ id, ...body }) => ({ url: `city/update/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Districts"],
    }),

    deleteDistrict: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `city/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Districts"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
} = locationApi;
