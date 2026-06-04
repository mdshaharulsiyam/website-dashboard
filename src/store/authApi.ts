import { baseApi } from "./baseApi";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  token: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  img?: string;
  phone?: string;
  block: boolean;
  is_verified: boolean;
  is_identity_verified?: boolean;
  use_type?: string;
  createdAt?: string;
}

export interface ProfileResponse {
  message: string;
  data: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: "auth/sign-in",
        method: "POST",
        body,
      }),
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => "auth/profile",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    updateProfile: builder.mutation<ProfileResponse, FormData>({
      query: (body) => ({
        url: "auth/update-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    changePassword: builder.mutation<
      { message: string },
      { old_password: string; password: string; confirm_password: string }
    >({
      query: (body) => ({
        url: "auth/change-password",
        method: "POST",
        body,
      }),
    }),

    sendVerificationCode: builder.mutation<
      { success: boolean; message: string; data: { email: string } },
      { email: string }
    >({
      query: (body) => ({
        url: "verification/create",
        method: "POST",
        body,
      }),
    }),

    verifyCode: builder.mutation<
      { success: boolean; message: string; data: { email: string; resetToken: string } },
      { email: string; code: string }
    >({
      query: (body) => ({
        url: "verification/verify",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string; data: { email: string; _id: string; role: string; name: string }; token: string },
      { resetToken: string; password: string; confirm_password: string }
    >({
      query: ({ resetToken, password, confirm_password }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { password, confirm_password },
        headers: { Authorization: `Bearer ${resetToken}` },
      }),
    }),

    createAdmin: builder.mutation<
      { success: boolean; message: string; data: any },
      { name: string; email: string; password: string; confirm_password: string }
    >({
      query: (body) => ({
        url: "auth/create-admin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"], // Or you can add an "Admins" tag later
    }),

    getAllAdmins: builder.query<{ success: boolean; data: AuthUser[]; total: number }, { search?: string; status?: string } | void>({
      query: (params) => {
        let qs = "";
        if (params) {
          const paramsList = [];
          if (params.search) paramsList.push(`search=${params.search}`);
          if (params.status) paramsList.push(`status=${params.status}`);
          if (paramsList.length > 0) qs = `?${paramsList.join("&")}`;
        }
        return `auth/get-all-admins${qs}`;
      },
      providesTags: ["Auth"],
    }),

    changeRole: builder.mutation<{ success: boolean; message: string; data: any }, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `auth/change-role/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Auth"],
    }),

    deleteAdmin: builder.mutation<{ success: boolean; message: string; data: any }, { id: string }>({
      query: ({ id }) => ({
        url: `auth/delete-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auth"],
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSendVerificationCodeMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useCreateAdminMutation,
  useGetAllAdminsQuery,
  useChangeRoleMutation,
  useDeleteAdminMutation,
} = authApi;
