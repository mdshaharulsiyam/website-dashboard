import { apiClient } from "@/lib/api-client";

export interface OverviewMonth {
  month?: number;
  label: string;
  revenue: number;
  amount?: number;
  orders: number;
  users?: number;
}

export interface OverviewRecentOrder {
  _id: string;
  final_amount: number;
  total_amount?: number;
  delivery_status?: string;
  payment_status?: string;
  order_date?: string;
  createdAt?: string;
  user?: { _id: string; name: string; email?: string } | string;
}

export interface OverviewStatusCount {
  status: string;
  label: string;
  count: number;
}

export interface OverviewLowStockProduct {
  _id: string;
  name: string;
  stock: number;
  img?: string[];
  price?: number;
  flag?: string;
}

export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  totalReviews: number;
  totalServices?: number;
  totalVendors?: number;
  totalBusinesses?: number;
  totalCoupons?: number;
  totalPendingOrders?: number;
  totalDeliveredOrders?: number;
  totalCanceledOrders?: number;
  revenueToday?: number;
  revenueWeek?: number;
  revenueMonth?: number;
  ordersToday?: number;
  ordersThisWeek?: number;
  ordersThisMonth?: number;
  newCustomersToday?: number;
  averageOrderValue?: number;
  avgRating?: number;
  lowStockProducts?: number;
  lowStockProductList?: OverviewLowStockProduct[];
  ordersByStatus?: Record<string, number>;
  orderStatusChart?: OverviewStatusCount[];
  recentOrders?: OverviewRecentOrder[];
  revenueChart?: OverviewMonth[];
  monthlyOverview?: OverviewMonth[];
  [key: string]: unknown;
}

export const overviewService = {
  getAdminOverview: async (): Promise<{ data: OverviewStats; message: string }> => {
    const { data } = await apiClient.get("/dashboard/get-overview");
    return data;
  },

  getPublicStats: async (): Promise<{ data: OverviewStats; message: string }> => {
    const { data } = await apiClient.get("/dashboard/get-stats");
    return data;
  },
};
