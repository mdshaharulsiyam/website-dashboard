// ─── Enums ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Printing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentMethod = "bKash" | "Nagad" | "Card" | "COD";
export type PaymentStatus = "Paid" | "Unpaid" | "Refunded" | "Partial";

export type BeeLevel = "Larva" | "Worker" | "Drone" | "Queen" | "Royal";

export type AdminRole = "Super Admin" | "Manager" | "Support" | "Analyst";

export type VendorStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export type SupportTicketStatus = "Open" | "In Progress" | "Resolved";

export type SupportPriority = "Normal" | "Urgent" | "VIP";

export type CouponType = "percentage" | "flat";

export type PostStatus = "Published" | "Flagged" | "Featured" | "Removed";

export type ShippingZone = "Dhaka Inside" | "Dhaka Outside" | "Rest of BD";

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Address {
  line1: string;
  line2?: string;
  area: string;
  zone: ShippingZone;
  city: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  designPreview: string;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  adminName?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: Address;
  courier?: string;
  trackingNumber?: string;
  timeline: OrderTimeline[];
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  reason: "Wrong Size" | "Defective Print" | "Wrong Item" | "Other";
  description: string;
  photos: string[];
  status: "Pending" | "Approved" | "Rejected" | "Partial Refund";
  refundAmount?: number;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ProductVariant {
  size: "S" | "M" | "L" | "XL" | "XXL";
  color: string;
  stock: number;
  price: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  designFile?: string;
  variants: ProductVariant[];
  basePrice: number;
  originalPrice?: number;
  costPrice: number;
  isNew: boolean;
  isDiscounted: boolean;
  discountPercent?: number;
  isLimitedEdition: boolean;
  editionSize?: number;
  status: "active" | "draft" | "archived";
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  vendorId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSubmission {
  id: string;
  vendorId: string;
  vendorName: string;
  designName: string;
  designFiles: string[];
  category: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  variantColor: string;
  previousQty: number;
  newQty: number;
  change: number;
  reason: string;
  adminId: string;
  adminName: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  beeLevel: BeeLevel;
  totalOrders: number;
  totalSpend: number;
  addresses: Address[];
  wardrobeItems: number;
  joinedAt: string;
  lastActive: string;
  status: "Active" | "Banned";
  loyaltyPoints: number;
  loginHistory: { device: string; ip: string; timestamp: string }[];
}

export interface WardrobePost {
  id: string;
  customerId: string;
  customerName: string;
  customerBeeLevel: BeeLevel;
  image: string;
  caption: string;
  productId?: string;
  productName?: string;
  status: PostStatus;
  isFeatured: boolean;
  shares: { whatsapp: number; twitter: number; facebook: number };
  totalShares: number;
  reportCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  parentId?: string;
  order: number;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  isPinned: boolean;
  productIds: string[];
  startDate: string;
  endDate?: string;
  status: "active" | "scheduled" | "ended";
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxUses: number;
  perUserLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: "active" | "inactive" | "expired";
  revenueInfluenced: number;
  createdAt: string;
}

export interface FlashSale {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice: number;
  startTime: string;
  endTime: string;
  status: "scheduled" | "active" | "ended";
}

export interface PromoBanner {
  id: string;
  image: string;
  ctaLink: string;
  ctaText: string;
  headline: string;
  subheadline?: string;
  order: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "scheduled";
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolio: string[];
  commissionRate: number;
  status: VendorStatus;
  totalSales: number;
  pendingCommission: number;
  paidCommission: number;
  designsApproved: number;
  designsPending: number;
  appliedAt: string;
  approvedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: "customer" | "admin";
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  beeLevel: BeeLevel;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportPriority;
  assignedTo?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  adminReply?: string;
  isFlagged: boolean;
  createdAt: string;
  approvedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  targetId?: string;
  targetType?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
  isActive: boolean;
  lastModified: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  trigger: string;
  body: string;
  isActive: boolean;
  lastModified: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "email" | "sms" | "push";
  segment: "all" | BeeLevel | "new" | "returning";
  status: "draft" | "sent" | "scheduled";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openRate?: number;
  createdAt: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
  percent: number;
}

export interface FunnelStep {
  step: string;
  count: number;
  dropoffRate: number;
}

// ─── Dashboard Widget Types ───────────────────────────────────────────────────

export interface DashboardStats {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  revenueTodayChange: number;
  revenueWeekChange: number;
  revenueMonthChange: number;
  ordersToday: number;
  ordersByStatus: Record<OrderStatus, number>;
  newCustomersToday: number;
  returningRatio: number;
  topSellingProduct: { id: string; name: string; image: string; salesCount: number };
  lowStockProducts: { id: string; name: string; qty: number }[];
  hivePostsToday: number;
  hiveSharesToday: number;
  pendingDesignApprovals: number;
  abandonedCarts: number;
  cartRecoveryRate: number;
  liveVisitors: number;
}
