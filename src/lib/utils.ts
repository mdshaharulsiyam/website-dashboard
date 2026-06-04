import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "৳0";
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  if (isNaN(value)) return "0";
  return value.toLocaleString("en-BD");
}

export function formatPhone(phone: string): string {
  // Bangladesh phone: +880 1X-XXXX-XXXX
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(dateStr: string, includeTime = false): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (includeTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return date.toLocaleDateString("en-GB", opts);
}

export function calcDiscountPercent(original: number, sale: number): number {
  if (!original || original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateCouponCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function parseCSVNumber(val: string): number {
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export function getChangeColor(change: number): string {
  if (change > 0) return "text-emerald-600";
  if (change < 0) return "text-red-500";
  return "text-slate-500";
}

export function getChangeIcon(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function downloadCSV(filename: string, rows: string[][]): void {
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Printing: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
  Refunded: "bg-slate-100 text-slate-800",
};

export const BEE_LEVEL_COLORS: Record<string, string> = {
  Larva: "bg-gray-100 text-gray-700",
  Worker: "bg-amber-100 text-amber-700",
  Drone: "bg-orange-100 text-orange-700",
  Queen: "bg-yellow-100 text-yellow-700",
  Royal: "bg-yellow-200 text-yellow-900",
};

export const BEE_LEVEL_THRESHOLDS: Record<string, number> = {
  Larva: 0,
  Worker: 3,
  Drone: 8,
  Queen: 20,
  Royal: 50,
};

export const MODULES = [
  "Dashboard",
  "Orders",
  "Products",
  "Inventory",
  "Customers",
  "My Hive",
  "Categories",
  "Promotions",
  "Vendors",
  "Support",
  "Reviews",
  "Analytics",
  "Notifications",
  "Settings",
] as const;

export type Module = (typeof MODULES)[number];

export const ROLE_PERMISSIONS: Record<string, Module[]> = {
  "Super Admin": [...MODULES],
  Manager: ["Dashboard", "Orders", "Products", "Inventory", "Customers", "My Hive", "Categories", "Promotions", "Vendors", "Reviews", "Analytics"],
  Support: ["Dashboard", "Orders", "Customers", "My Hive", "Support", "Reviews"],
  Analyst: ["Dashboard", "Analytics"],
};
