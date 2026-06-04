import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import { useUIStore, useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
  useUserNotifications,
} from "@/hooks/use-notifications";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  pendingApprovals?: number;
  lowStockCount?: number;
}

export function Header({ pendingApprovals = 0, lowStockCount = 0 }: HeaderProps) {
  const { toggleSidebar } = useUIStore();
  const { currentUser } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: unreadData } = useUnreadNotificationCount();
  const { data: notificationsData } = useUserNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.data?.count ?? 0;
  const notifications = notificationsData?.data ?? [];
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const totalAlerts = pendingApprovals + lowStockCount + unreadCount;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
      {/* Mobile menu toggle */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="hidden sm:flex flex-1 max-w-xs relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input placeholder="Search orders, products..." className="pl-9 h-8 text-sm bg-slate-50" />
      </div>

      <div className="flex-1 sm:flex-none" />

      <div className="flex items-center gap-2">
        {/* Role badge */}
        {currentUser && (
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
            {currentUser.role}
          </Badge>
        )}

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title={`${totalAlerts} alerts`}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-400">{unreadCount} unread</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={unreadCount === 0 || markAllRead.isPending}
                  onClick={() => markAllRead.mutate()}
                >
                  Mark all read
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-slate-400">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((notification) => {
                    const unread = isAdmin ? !notification.read_by_admin : !notification.read_by_user;

                    return (
                      <button
                        key={notification._id}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50"
                        onClick={() => unread && markRead.mutate(notification._id)}
                      >
                        <div className="flex items-start gap-2">
                          {unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{notification.title}</p>
                            <p className="line-clamp-2 text-xs text-slate-500">{notification.message}</p>
                            <p className="mt-1 text-xs text-slate-400">{formatDate(notification.createdAt ?? "", true)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <Link
                to="/notifications"
                className="block border-t border-slate-100 px-3 py-2 text-center text-xs font-medium text-amber-700 hover:bg-amber-50"
                onClick={() => setNotificationsOpen(false)}
              >
                Open notification center
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
