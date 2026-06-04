import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Download } from "lucide-react";
import { mockRevenueData, mockCategoryRevenue, mockFunnelData, mockCustomers, mockOrders } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent, formatNumber, BEE_LEVEL_COLORS, downloadCSV } from "@/lib/utils";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];
const LEVELS = ["Larva", "Worker", "Drone", "Queen", "Royal"] as const;

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  const periodData = mockRevenueData.slice(-parseInt(period));
  const totalRevenue = periodData.reduce((a, d) => a + d.revenue, 0);
  const totalOrders = periodData.reduce((a, d) => a + d.orders, 0);
  const avgAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const levelDist = LEVELS.map((level) => ({
    level,
    count: mockCustomers.filter((c) => c.beeLevel === level).length,
  }));

  function exportRevenue() {
    const rows = [["Date", "Revenue", "Orders", "AOV"], ...periodData.map((d) => [d.date, String(d.revenue), String(d.orders), String(d.aov)])];
    downloadCSV(`revenue-${period}d.csv`, rows);
  }

  function exportOrders() {
    const rows = [["Order ID", "Status", "Payment", "Total", "Date"], ...mockOrders.map((o) => [o.id, o.status, o.paymentMethod, String(o.total), o.createdAt])];
    downloadCSV("orders-report.csv", rows);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics & Reports"
        description="Revenue, orders, customers, product performance"
        actions={
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="revenue">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="hive">Hive</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Revenue" value={totalRevenue} isCurrency icon={null} />
            <StatCard title="Total Orders" value={totalOrders} icon={null} />
            <StatCard title="Avg Order Value" value={formatCurrency(avgAOV)} icon={null} />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Revenue Trend</CardTitle>
                <Button variant="outline" size="sm" onClick={exportRevenue}><Download className="h-4 w-4" />Export</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue by Category</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={mockCategoryRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="revenue" paddingAngle={3}>
                      {mockCategoryRevenue.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "Revenue"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {mockCategoryRevenue.map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-700">{c.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(c.revenue)}</p>
                        <p className="text-xs text-slate-400">{c.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Orders" value={mockOrders.length} icon={null} />
            <StatCard title="Delivered" value={mockOrders.filter((o) => o.status === "Delivered").length} icon={null} />
            <StatCard title="Cancellation Rate" value={formatPercent((mockOrders.filter((o) => o.status === "Cancelled").length / mockOrders.length) * 100)} icon={null} />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Daily Orders</CardTitle>
                <Button variant="outline" size="sm" onClick={exportOrders}><Download className="h-4 w-4" />Export</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Customers" value={mockCustomers.length} icon={null} />
            <StatCard title="Active" value={mockCustomers.filter((c) => c.status === "Active").length} icon={null} />
            <StatCard title="Banned" value={mockCustomers.filter((c) => c.status === "Banned").length} icon={null} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Bee Level Distribution</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {levelDist.map(({ level, count }) => (
                <div key={level} className="flex items-center gap-3">
                  <Badge className={`w-20 text-xs justify-center ${BEE_LEVEL_COLORS[level]}`}>{level}</Badge>
                  <div className="flex-1 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${mockCustomers.length > 0 ? (count / mockCustomers.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                  <span className="text-xs text-slate-400 w-10">{mockCustomers.length > 0 ? formatPercent((count / mockCustomers.length) * 100, 0) : "0%"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">AOV Trend</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => `৳${v}`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "AOV"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="aov" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Conversion Funnel</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockFunnelData.map((step, i) => (
                <div key={step.step} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-slate-700 shrink-0">{step.step}</span>
                  <div className="flex-1 h-8 rounded-lg bg-slate-100 relative overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-amber-400 flex items-center px-3 transition-all"
                      style={{ width: `${(step.count / mockFunnelData[0].count) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{formatNumber(step.count)}</span>
                    </div>
                  </div>
                  {i > 0 && (
                    <Badge variant="destructive" className="text-xs shrink-0">-{formatPercent(step.dropoffRate, 0)}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hive" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Posts Today" value={23} icon={null} />
            <StatCard title="Shares Today" value={87} icon={null} />
            <StatCard title="Viral Coefficient" value="1.8x" icon={null} />
          </div>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Share breakdown: WhatsApp 45% · Facebook 31% · Twitter 24%</p>
              <div className="mt-4 space-y-2">
                {[{ platform: "WhatsApp", pct: 45, color: "bg-green-400" }, { platform: "Facebook", pct: 31, color: "bg-blue-500" }, { platform: "Twitter/X", pct: 24, color: "bg-sky-400" }].map(({ platform, pct, color }) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-slate-600">{platform}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10">{pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
