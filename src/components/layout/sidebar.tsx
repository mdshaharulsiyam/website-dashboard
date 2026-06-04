import { Link, useLocation } from "react-router-dom";
import {
  type LucideIcon,
  LayoutDashboard, ShoppingBag, Package, Warehouse, Users, Heart,
  FolderOpen, Tag, Store, MessageSquare, Star, BarChart3, Bell,
  Settings, ChevronRight, X, LogOut, Hexagon, ImageIcon, CircleHelp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  module: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "Dashboard" },
  { label: "Orders", href: "/orders", icon: ShoppingBag, module: "Orders" },
  { label: "Products", href: "/products", icon: Package, module: "Products" },
  // { label: "Inventory", href: "/inventory", icon: Warehouse, module: "Inventory" },
  { label: "Customers", href: "/customers", icon: Users, module: "Customers" },
  // { label: "My Hive", href: "/hive", icon: Heart, module: "My Hive" },
  { label: "Categories", href: "/categories", icon: FolderOpen, module: "Categories" },
  { label: "Promotions", href: "/promotions", icon: Tag, module: "Promotions", exact: true },
  { label: "Banners", href: "/promotions/banners", icon: ImageIcon, module: "Promotions" },
  // { label: "Vendors", href: "/vendors", icon: Store, module: "Vendors" },
  // { label: "Support", href: "/support", icon: MessageSquare, module: "Support" },
  { label: "Reviews", href: "/reviews", icon: Star, module: "Reviews" },
  // { label: "Analytics", href: "/analytics", icon: BarChart3, module: "Analytics" },
  { label: "Notifications", href: "/notifications", icon: Bell, module: "Notifications" },
  { label: "FAQs", href: "/faqs", icon: CircleHelp, module: "Settings" },
  { label: "Settings", href: "/settings", icon: Settings, module: "Settings" },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { currentUser, hasPermission, logout } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 flex flex-col bg-slate-900 text-white transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Hexagon className="h-5 w-5 text-white fill-white/30" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Looks<span className="text-amber-400">Bee</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, module, exact }) => {
            if (!hasPermission(module)) return null;
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-amber-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        {currentUser && (
          <div className="border-t border-slate-700 p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-500 text-white text-xs">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
