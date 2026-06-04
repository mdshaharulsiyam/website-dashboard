import { baseApi } from "./baseApi";

export interface Notification {
  _id: string;
  user?: { _id: string; name: string; img: string | null };
  title: string;
  message: string;
  read_by_admin: boolean;
  read_by_user: boolean;
  createdAt?: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationListResponse, void>({
      query: () => "notification/get-all",
      providesTags: ["Notifications"],
    }),

    markNotificationRead: builder.mutation<NotificationResponse, string>({
      query: (id) => ({ url: `notification/read/${id}`, method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationApi;
