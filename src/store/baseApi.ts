import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = "http://localhost:5000/";
// export const BASE_URL = "http://13.229.171.117:5000/";

export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("lb_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "Products",
    "Orders",
    "Categories",
    "Services",
    "Coupons",
    "Banners",
    "Reviews",
    "Settings",
    "Vendors",
    "Support",
    "Divisions",
    "Districts",
    "FAQs",
    "Notifications",
    "Cart",
    "ShippingAddress",
  ],
  endpoints: () => ({}),
});
