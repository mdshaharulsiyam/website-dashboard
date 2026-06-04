import { baseApi } from "./baseApi";

export interface Setting {
  _id?: string;
  name: string;
  desc?: string;
}

export interface SettingResponse {
  success: boolean;
  message?: string;
  data?: Setting;
}

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSetting: builder.query<SettingResponse, string>({
      query: (name) => `setting/${name}`,
      providesTags: ["Settings"],
    }),

    upsertSetting: builder.mutation<SettingResponse, { name: string; desc: string }>({
      query: (body) => ({ url: "setting/create", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingQuery, useUpsertSettingMutation } = settingApi;
