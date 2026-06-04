import { apiClient } from "@/lib/api-client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  token: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    img?: string;
    phone?: string;
    block: boolean;
    is_verified: boolean;
  };
}

export interface ProfileResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    img?: string;
    phone?: string;
    block: boolean;
    is_verified: boolean;
    is_identity_verified: boolean;
    use_type: string;
    createdAt: string;
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/sign-in", payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>("/auth/profile");
    return data;
  },

  updateProfile: async (payload: FormData): Promise<ProfileResponse> => {
    const { data } = await apiClient.patch<ProfileResponse>("/auth/update-profile", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  changePassword: async (payload: {
    old_password: string;
    password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/auth/change-password", payload);
    return data;
  },

  blockUser: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch(`/auth/block/${id}`);
    return data;
  },

  verifyIdentity: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch(`/auth/verify-identity/${id}`);
    return data;
  },
};
