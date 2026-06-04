import { baseApi } from "./baseApi";

export interface ShippingAddress {
  _id: string;
  address: string;
  zip: string;
  phone: string;
  full_name: string;
}

export interface ShippingAddressListResponse {
  success: boolean;
  message: string;
  data: ShippingAddress[];
}

export interface ShippingAddressResponse {
  success: boolean;
  message: string;
  data: ShippingAddress;
}

export interface CreateShippingAddressPayload {
  address: string;
  zip: string;
  phone: string;
  full_name: string;
}

export const shippingAddressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShippingAddresses: builder.query<ShippingAddressListResponse, void>({
      query: () => "shipping-address/get-all",
      providesTags: ["ShippingAddress"],
    }),

    createShippingAddress: builder.mutation<ShippingAddressResponse, CreateShippingAddressPayload>({
      query: (body) => ({ url: "shipping-address/create", method: "POST", body }),
      invalidatesTags: ["ShippingAddress"],
    }),

    deleteShippingAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `shipping-address/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["ShippingAddress"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
  useDeleteShippingAddressMutation,
} = shippingAddressApi;
