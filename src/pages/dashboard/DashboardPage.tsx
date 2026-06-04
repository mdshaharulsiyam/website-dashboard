import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Layers,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminOverview } from "@/hooks/use-overview";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

function compactMoney(value: number) {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

function orderCustomerName(user: unknown) {
  return typeof user === "object" && user !== null && "name" in user
    ? String((user as { name?: string }).name ?? "Customer")
    : "Customer";
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminOverview();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const stats = data?.data;
  const revenueChart = stats?.monthlyOverview?.length
    ? stats.monthlyOverview
    : stats?.revenueChart ?? [];
  const recentOrders = stats?.recentOrders ?? [];
  const lowStockProducts = stats?.lowStockProductList ?? [];

  const orderStatusChart = useMemo(() => {
    if (stats?.orderStatusChart?.length) return stats.orderStatusChart;

    return Object.entries(stats?.ordersByStatus ?? {}).map(([status, count]) => ({
      status,
      label: status.replace(/_/g, " "),
      count,
    }));
  }, [stats?.orderStatusChart, stats?.ordersByStatus]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
        <p className="text-sm font-medium text-red-500">Failed to load dashboard data.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Overview | ${currentTime.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Today"
          value={stats.revenueToday ?? 0}
          isCurrency
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Revenue This Month"
          value={stats.revenueMonth ?? 0}
          isCurrency
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="New Customers Today"
          value={stats.newCustomersToday ?? 0}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue ?? 0}
          isCurrency
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts ?? 0}
          icon={<Package className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalUsers ?? 0}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Average Order"
          value={stats.averageOrderValue ?? 0}
          isCurrency
          icon={<TrendingUp className="h-5 w-5 text-pink-600" />}
          iconBg="bg-pink-50"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories ?? 0}
          icon={<Layers className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Reviews"
          value={stats.totalReviews ?? 0}
          icon={<Star className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-50"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts ?? 0}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-50"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {revenueChart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Tag className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">No revenue data available yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueChart} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  tickFormatter={(value) => compactMoney(Number(value))}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "orders" ? Number(value ?? 0) : formatCurrency(Number(value ?? 0)),
                    name === "orders" ? "Orders" : "Revenue",
                  ]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Orders By Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {orderStatusChart.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">No order status data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={orderStatusChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip
                    formatter={(value) => [Number(value ?? 0), "Orders"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#fbbf24" radius={[3, 3, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">No recent orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.slice(0, 8).map((order) => (
                  <div key={order._id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-medium text-slate-700">#{order._id.slice(-8)}</p>
                      <p className="truncate text-xs text-slate-400">
                        {orderCustomerName(order.user)} | {formatDate(order.order_date ?? order.createdAt ?? "")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(order.final_amount ?? 0)}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {(order.delivery_status ?? "pending").replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lowest Stock Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Stock: {product.stock}</p>
                  {product.flag && (
                    <Badge variant="secondary" className="mt-2 text-xs capitalize">
                      {product.flag}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
