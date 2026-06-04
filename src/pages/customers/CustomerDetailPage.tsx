import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Monitor, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, BEE_LEVEL_COLORS, BEE_LEVEL_THRESHOLDS, getInitials } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-customers";
import { mapApiCustomerToCustomer } from "@/services/customer.service";
import { useOrders } from "@/hooks/use-orders";
import type { ApiOrder } from "@/services/order.service";

const LEVEL_ORDER = ["Larva", "Worker", "Drone", "Queen", "Royal"] as const;

function orderUserId(order: ApiOrder): string {
  return typeof order.user === "object" ? order.user._id : order.user;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customersData, isError, isLoading, refetch } = useCustomers();
  const { data: ordersData, isLoading: ordersLoading } = useOrders();

  const customer = customersData?.data
    .map(mapApiCustomerToCustomer)
    .find((item) => item.id === id);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl space-y-5">
        <PageHeader
          title="Customer"
          description="Unable to load customer profile"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Try Again
              </Button>
              <Link to="/customers">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  if (!customer) return <Navigate to="/not-found" replace />;

  const customerOrders = (ordersData?.data ?? []).filter((order) => orderUserId(order) === customer.id);
  const currentLevelIdx = LEVEL_ORDER.indexOf(customer.beeLevel as (typeof LEVEL_ORDER)[number]);
  const nextLevel = LEVEL_ORDER[currentLevelIdx + 1];
  const currentThreshold = BEE_LEVEL_THRESHOLDS[customer.beeLevel] ?? 0;
  const nextThreshold = nextLevel ? BEE_LEVEL_THRESHOLDS[nextLevel] ?? customer.totalOrders : customer.totalOrders;
  const progress =
    nextThreshold > currentThreshold
      ? ((customer.totalOrders - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.joinedAt)}`}
        actions={
          <Link to="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 flex flex-col items-center text-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className={`text-xl font-bold ${BEE_LEVEL_COLORS[customer.beeLevel]}`}>
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900">{customer.name}</p>
                <p className="text-sm text-slate-500">{customer.email}</p>
                <p className="text-sm text-slate-500">{customer.phone || "No phone"}</p>
              </div>
              <Badge className={`text-sm ${BEE_LEVEL_COLORS[customer.beeLevel]}`}>{customer.beeLevel}</Badge>
              <Badge variant={customer.status === "Active" ? "success" : "destructive"}>{customer.status}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bee Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Current: <strong>{customer.beeLevel}</strong>
                </span>
                {nextLevel && (
                  <span className="text-slate-500">
                    Next: <strong>{nextLevel}</strong>
                  </span>
                )}
              </div>
              <Progress value={Math.min(100, Math.max(0, progress))} className="h-2" />
              <p className="text-xs text-center text-slate-500">
                {customer.totalOrders} orders
                {nextLevel && ` | ${Math.max(0, nextThreshold - customer.totalOrders)} more to reach ${nextLevel}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Total Orders", value: customer.totalOrders },
                { label: "Total Spend", value: formatCurrency(customer.totalSpend) },
                { label: "Wardrobe Items", value: customer.wardrobeItems },
                { label: "Loyalty Points", value: customer.loyaltyPoints },
                { label: "Last Active", value: formatDate(customer.lastActive) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Address Book</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-slate-400">No saved addresses</p>
              ) : (
                customer.addresses.map((address, index) => (
                  <div key={`${address.line1}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.area}, {address.city}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {address.zone}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Order History ({customerOrders.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {ordersLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No orders placed</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <Link to={`/orders/${order._id}`} className="text-sm font-mono font-semibold text-amber-700 hover:underline">
                          #{order._id.slice(-8)}
                        </Link>
                        <p className="text-xs text-slate-400">{formatDate(order.order_date ?? order.createdAt ?? "")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(order.final_amount)}</p>
                        <Badge
                          className={`text-xs ${
                            order.delivery_status === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {(order.delivery_status ?? "pending").replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {customerOrders.length > 5 && (
                    <p className="text-xs text-slate-400 text-center pt-2">+{customerOrders.length - 5} more orders</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm">Login History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-400">No login records</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
